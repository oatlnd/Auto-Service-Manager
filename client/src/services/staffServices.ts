// src/services/staffService.ts
// Shared staff data service - single source of truth for staff data

export type Staff = {
  id: string;
  name: string;
  email?: string;
  role: string; // e.g. 'technician', 'maintenance', 'manager', etc.
  phone?: string;
  // add other fields used across your app
};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: 'same-origin' });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`fetch ${url} failed: ${res.status} ${res.statusText} - ${text}`);
  }
  return (await res.json()) as T;
}

// Primary function to get all staff. Adjust URL to match your backend or static file.
export async function fetchAllStaff(): Promise<Staff[]> {
  // Use a single API endpoint that returns the full staff list
  // Change to the actual path in your app, for example '/api/staff' or '/data/staff.json'
  return await fetchJson<Staff[]>('/api/staff');
}

// Convenience selectors
export function filterTechnicians(staff: Staff[]): Staff[] {
  return staff.filter(s => (s.role || '').toLowerCase() === 'technician');
}

export function filterMaintenance(staff: Staff[]): Staff[] {
  return staff.filter(s => (s.role || '').toLowerCase() === 'maintenance' || (s.role || '').toLowerCase() === 'staff-maintenance');
}