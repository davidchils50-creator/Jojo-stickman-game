import { getSupabaseClient, SupabaseRoomRow } from './supabaseClient';

export interface PublicRoomInfo {
  id: string;
  room_name: string;
  host_char: string;
  status: 'waiting' | 'connected' | 'closed';
  connection_mode: 'peerjs' | 'supabase';
  created_at: string;
  updated_at?: number;
}

const PUBLIC_TOPIC = 'jojo_stickman_public_rooms_v2';
const NTFY_PUB_URL = `https://ntfy.sh/${PUBLIC_TOPIC}`;

// In-memory cache & BroadcastChannel for same-device multi-tab fast sync
let memoryRoomsMap = new Map<string, PublicRoomInfo>();

let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('jojo_public_rooms_channel');
    broadcastChannel.onmessage = (event) => {
      if (event.data && event.data.type === 'room_update') {
        const room = event.data.room as PublicRoomInfo;
        if (room.status === 'closed') {
          memoryRoomsMap.delete(room.id);
        } else {
          memoryRoomsMap.set(room.id, room);
        }
      }
    };
  }
} catch (e) {
  console.warn("BroadcastChannel not supported or threw error:", e);
}

/**
 * Publish a new or updated room to the global public directory (ntfy + Supabase + BroadcastChannel)
 */
export async function publishPublicRoom(room: PublicRoomInfo): Promise<void> {
  const roomPayload: PublicRoomInfo = {
    ...room,
    updated_at: Date.now(),
  };

  memoryRoomsMap.set(room.id, roomPayload);

  // 1. Same-device / tab broadcast
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: 'room_update', room: roomPayload });
    } catch (e) {
      // ignore
    }
  }

  // 2. Global public ntfy relay (works across 2 different phones on different networks)
  try {
    fetch(NTFY_PUB_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roomPayload),
    }).catch(err => console.warn("Notice: ntfy publish warning:", err));
  } catch (e) {
    console.warn("Error publishing to ntfy signaling:", e);
  }

  // 3. Supabase fallback database (if configured/reachable)
  try {
    const supabase = getSupabaseClient();
    supabase.from('rooms').upsert({
      id: room.id,
      room_name: room.room_name,
      host_char: room.host_char,
      status: room.status,
      created_at: room.created_at,
    }).then(({ error }) => {
      if (error) console.warn("Supabase upsert public room notice:", error.message);
    });
  } catch (e) {
    // ignore
  }
}

/**
 * Remove a public room when host disconnects or room closes
 */
export async function unpublishPublicRoom(roomId: string): Promise<void> {
  if (!roomId) return;
  const closedRoom: PublicRoomInfo = {
    id: roomId,
    room_name: '',
    host_char: 'jotaro',
    status: 'closed',
    connection_mode: 'peerjs',
    created_at: new Date().toISOString(),
    updated_at: Date.now(),
  };

  memoryRoomsMap.delete(roomId);

  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: 'room_update', room: closedRoom });
    } catch (e) {
      // ignore
    }
  }

  try {
    fetch(NTFY_PUB_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(closedRoom),
    }).catch(() => {});
  } catch (e) {
    // ignore
  }

  try {
    const supabase = getSupabaseClient();
    supabase.from('rooms').delete().eq('id', roomId).then(() => {});
  } catch (e) {
    // ignore
  }
}

/**
 * Fetch all active public rooms from global relay (ntfy) + Supabase + local cache
 */
export async function fetchActivePublicRooms(): Promise<PublicRoomInfo[]> {
  const roomsMap = new Map<string, PublicRoomInfo>();

  // Load from local memory cache first
  const now = Date.now();
  const ROOM_TTL_MS = 30 * 1000; // 30 seconds active TTL for heartbeats

  for (const [id, room] of memoryRoomsMap.entries()) {
    if (room.status === 'waiting' && room.updated_at && (now - room.updated_at < ROOM_TTL_MS)) {
      roomsMap.set(id, room);
    }
  }

  // Fetch from global public relay (ntfy)
  try {
    const ntfyRes = await fetch(`${NTFY_PUB_URL}/json?poll=1&since=1m`, { signal: AbortSignal.timeout(3500) });
    if (ntfyRes.ok) {
      const text = await ntfyRes.text();
      const lines = text.trim().split('\n');
      for (const line of lines) {
        if (!line) continue;
        try {
          const item = JSON.parse(line);
          if (item && item.message) {
            const roomData = JSON.parse(item.message) as PublicRoomInfo;
            if (roomData && roomData.id) {
              const itemAge = roomData.updated_at ? (now - roomData.updated_at) : 0;
              if (roomData.status === 'closed') {
                roomsMap.delete(roomData.id);
                memoryRoomsMap.delete(roomData.id);
              } else if (roomData.status === 'waiting' && itemAge < ROOM_TTL_MS) {
                // Keep newest update
                const existing = roomsMap.get(roomData.id);
                if (!existing || (roomData.updated_at || 0) >= (existing.updated_at || 0)) {
                  roomsMap.set(roomData.id, roomData);
                  memoryRoomsMap.set(roomData.id, roomData);
                }
              }
            }
          }
        } catch (e) {
          // ignore invalid json line
        }
      }
    }
  } catch (e) {
    console.warn("Global ntfy room poll notice:", e);
  }

  // Fetch from Supabase as secondary source
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('status', 'waiting')
      .order('created_at', { ascending: false })
      .limit(30);

    if (!error && data && Array.isArray(data)) {
      for (const row of data as SupabaseRoomRow[]) {
        if (row.id && row.status === 'waiting') {
          if (!roomsMap.has(row.id)) {
            roomsMap.set(row.id, {
              id: row.id,
              room_name: row.room_name || `Room ${row.id}`,
              host_char: row.host_char || 'jotaro',
              status: 'waiting',
              connection_mode: 'supabase',
              created_at: row.created_at || new Date().toISOString(),
              updated_at: Date.now(),
            });
          }
        }
      }
    }
  } catch (e) {
    console.warn("Supabase public room fetch notice:", e);
  }

  return Array.from(roomsMap.values()).sort((a, b) => {
    return (b.updated_at || 0) - (a.updated_at || 0);
  });
}
