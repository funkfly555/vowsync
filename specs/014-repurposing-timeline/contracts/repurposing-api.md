# API Contracts: Repurposing Instructions

**Feature**: 014-repurposing-timeline
**Date**: 2026-01-16
**Backend**: Supabase (PostgreSQL + RLS)

---

## Overview

All operations use the Supabase JavaScript client with authenticated sessions. RLS policies enforce data access control at the database level.

---

## 1. Fetch All Instructions

### Query: List instructions for a wedding

```typescript
/**
 * Fetch all repurposing instructions for a wedding with relations
 * @param weddingId - UUID of the wedding
 * @returns Array of instructions with item, event, and vendor details
 */
async function fetchRepurposingInstructions(
  weddingId: string
): Promise<RepurposingInstructionWithRelations[]> {
  const { data, error } = await supabase
    .from('repurposing_instructions')
    .select(`
      *,
      wedding_items!wedding_item_id(id, description, category),
      from_event:events!from_event_id(id, event_name, event_date, event_end_time),
      to_event:events!to_event_id(id, event_name, event_date, event_start_time),
      vendors!responsible_vendor_id(id, company_name)
    `)
    .eq('wedding_id', weddingId)
    .order('pickup_time', { ascending: true });

  if (error) {
    console.error('Error fetching repurposing instructions:', error);
    throw error;
  }

  return data as RepurposingInstructionWithRelations[];
}
```

**Response Shape**:
```json
[
  {
    "id": "uuid",
    "wedding_id": "uuid",
    "wedding_item_id": "uuid",
    "from_event_id": "uuid",
    "from_event_end_time": "18:00:00",
    "pickup_location": "Ceremony Tent",
    "pickup_time": "18:30:00",
    "pickup_time_relative": "30 min after ceremony",
    "to_event_id": "uuid",
    "to_event_start_time": "19:00:00",
    "dropoff_location": "Reception Hall",
    "dropoff_time": "18:45:00",
    "dropoff_time_relative": "15 min before reception",
    "responsible_party": "Setup Crew",
    "responsible_vendor_id": "uuid",
    "handling_notes": "Handle with care",
    "setup_required": true,
    "breakdown_required": true,
    "is_critical": false,
    "status": "pending",
    "started_at": null,
    "completed_at": null,
    "completed_by": null,
    "issue_description": null,
    "created_at": "2026-01-16T10:00:00Z",
    "updated_at": "2026-01-16T10:00:00Z",
    "wedding_items": {
      "id": "uuid",
      "description": "8-foot Tables",
      "category": "Tables"
    },
    "from_event": {
      "id": "uuid",
      "event_name": "Ceremony",
      "event_date": "2026-06-15",
      "event_end_time": "18:00:00"
    },
    "to_event": {
      "id": "uuid",
      "event_name": "Reception",
      "event_date": "2026-06-15",
      "event_start_time": "19:00:00"
    },
    "vendors": {
      "id": "uuid",
      "company_name": "Elite Events"
    }
  }
]
```

---

## 2. Fetch Single Instruction

### Query: Get instruction by ID

```typescript
/**
 * Fetch a single repurposing instruction by ID
 * @param instructionId - UUID of the instruction
 * @returns Single instruction with relations
 */
async function fetchRepurposingInstruction(
  instructionId: string
): Promise<RepurposingInstructionWithRelations> {
  const { data, error } = await supabase
    .from('repurposing_instructions')
    .select(`
      *,
      wedding_items!wedding_item_id(id, description, category),
      from_event:events!from_event_id(id, event_name, event_date, event_end_time),
      to_event:events!to_event_id(id, event_name, event_date, event_start_time),
      vendors!responsible_vendor_id(id, company_name)
    `)
    .eq('id', instructionId)
    .single();

  if (error) {
    console.error('Error fetching repurposing instruction:', error);
    throw error;
  }

  return data as RepurposingInstructionWithRelations;
}
```

---

## 3. Create Instruction

### Mutation: Insert new instruction

```typescript
/**
 * Create a new repurposing instruction
 * @param instruction - Instruction data (excluding id, created_at, updated_at)
 * @returns Created instruction
 */
async function createRepurposingInstruction(
  instruction: Omit<RepurposingInstruction, 'id' | 'created_at' | 'updated_at'>
): Promise<RepurposingInstruction> {
  const { data, error } = await supabase
    .from('repurposing_instructions')
    .insert({
      wedding_id: instruction.wedding_id,
      wedding_item_id: instruction.wedding_item_id,
      from_event_id: instruction.from_event_id,
      from_event_end_time: instruction.from_event_end_time,
      pickup_location: instruction.pickup_location,
      pickup_time: instruction.pickup_time,
      pickup_time_relative: instruction.pickup_time_relative,
      to_event_id: instruction.to_event_id,
      to_event_start_time: instruction.to_event_start_time,
      dropoff_location: instruction.dropoff_location,
      dropoff_time: instruction.dropoff_time,
      dropoff_time_relative: instruction.dropoff_time_relative,
      responsible_party: instruction.responsible_party,
      responsible_vendor_id: instruction.responsible_vendor_id || null,
      handling_notes: instruction.handling_notes,
      setup_required: instruction.setup_required,
      breakdown_required: instruction.breakdown_required,
      is_critical: instruction.is_critical,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating repurposing instruction:', error);
    throw error;
  }

  return data;
}
```

**Request Body**:
```json
{
  "wedding_id": "uuid",
  "wedding_item_id": "uuid",
  "from_event_id": "uuid",
  "from_event_end_time": "18:00:00",
  "pickup_location": "Ceremony Tent",
  "pickup_time": "18:30:00",
  "pickup_time_relative": "30 min after ceremony",
  "to_event_id": "uuid",
  "to_event_start_time": "19:00:00",
  "dropoff_location": "Reception Hall",
  "dropoff_time": "18:45:00",
  "dropoff_time_relative": "15 min before reception",
  "responsible_party": "Setup Crew",
  "responsible_vendor_id": "uuid",
  "handling_notes": "Handle with care",
  "setup_required": true,
  "breakdown_required": true,
  "is_critical": false
}
```

---

## 4. Update Instruction

### Mutation: Update existing instruction

```typescript
/**
 * Update an existing repurposing instruction
 * @param instructionId - UUID of the instruction
 * @param updates - Partial instruction data to update
 * @returns Updated instruction
 */
async function updateRepurposingInstruction(
  instructionId: string,
  updates: Partial<Omit<RepurposingInstruction, 'id' | 'wedding_id' | 'created_at' | 'updated_at'>>
): Promise<RepurposingInstruction> {
  const { data, error } = await supabase
    .from('repurposing_instructions')
    .update(updates)
    .eq('id', instructionId)
    .select()
    .single();

  if (error) {
    console.error('Error updating repurposing instruction:', error);
    throw error;
  }

  return data;
}
```

---

## 5. Update Status

### Mutation: Status-specific updates

```typescript
/**
 * Start work on an instruction (pending → in_progress)
 */
async function startInstruction(instructionId: string): Promise<void> {
  const { error } = await supabase
    .from('repurposing_instructions')
    .update({
      status: 'in_progress',
      started_at: new Date().toISOString()
    })
    .eq('id', instructionId);

  if (error) {
    console.error('Error starting instruction:', error);
    throw error;
  }
}

/**
 * Complete an instruction (in_progress → completed)
 */
async function completeInstruction(
  instructionId: string,
  completedBy: string
): Promise<void> {
  const { error } = await supabase
    .from('repurposing_instructions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      completed_by: completedBy
    })
    .eq('id', instructionId);

  if (error) {
    console.error('Error completing instruction:', error);
    throw error;
  }
}

/**
 * Report an issue with an instruction
 */
async function reportIssue(
  instructionId: string,
  issueDescription: string
): Promise<void> {
  const { error } = await supabase
    .from('repurposing_instructions')
    .update({
      status: 'issue',
      issue_description: issueDescription
    })
    .eq('id', instructionId);

  if (error) {
    console.error('Error reporting issue:', error);
    throw error;
  }
}

/**
 * Resume work after resolving issue (issue → in_progress)
 */
async function resumeInstruction(instructionId: string): Promise<void> {
  const { error } = await supabase
    .from('repurposing_instructions')
    .update({
      status: 'in_progress',
      issue_description: null,
      started_at: new Date().toISOString() // Reset if not already set
    })
    .eq('id', instructionId);

  if (error) {
    console.error('Error resuming instruction:', error);
    throw error;
  }
}
```

---

## 6. Delete Instruction

### Mutation: Remove instruction

```typescript
/**
 * Delete a repurposing instruction
 * @param instructionId - UUID of the instruction
 */
async function deleteRepurposingInstruction(instructionId: string): Promise<void> {
  const { error } = await supabase
    .from('repurposing_instructions')
    .delete()
    .eq('id', instructionId);

  if (error) {
    console.error('Error deleting repurposing instruction:', error);
    throw error;
  }
}
```

---

## 7. Supporting Queries

### Fetch Items for Dropdown

```typescript
/**
 * Fetch wedding items for selection dropdown
 */
async function fetchItemsForDropdown(weddingId: string) {
  const { data, error } = await supabase
    .from('wedding_items')
    .select('id, description, category')
    .eq('wedding_id', weddingId)
    .order('category', { ascending: true });

  if (error) throw error;
  return data;
}
```

### Fetch Events for Dropdown

```typescript
/**
 * Fetch events for selection dropdown (with times for validation)
 */
async function fetchEventsForDropdown(weddingId: string) {
  const { data, error } = await supabase
    .from('events')
    .select('id, event_name, event_date, event_start_time, event_end_time')
    .eq('wedding_id', weddingId)
    .order('event_date', { ascending: true });

  if (error) throw error;
  return data;
}
```

### Fetch Vendors for Dropdown

```typescript
/**
 * Fetch vendors for optional selection dropdown
 */
async function fetchVendorsForDropdown(weddingId: string) {
  const { data, error } = await supabase
    .from('vendors')
    .select('id, company_name')
    .eq('wedding_id', weddingId)
    .order('company_name', { ascending: true });

  if (error) throw error;
  return data;
}
```

### Check Item Has Instructions

```typescript
/**
 * Check if an item has repurposing instructions (for indicator display)
 */
async function fetchItemsWithInstructions(weddingId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('repurposing_instructions')
    .select('wedding_item_id')
    .eq('wedding_id', weddingId);

  if (error) throw error;

  // Return unique item IDs
  return [...new Set(data?.map(d => d.wedding_item_id) || [])];
}
```

---

## 8. Query Key Patterns

```typescript
/**
 * TanStack Query key factory for repurposing instructions
 */
export const repurposingKeys = {
  all: ['repurposing-instructions'] as const,
  lists: () => [...repurposingKeys.all, 'list'] as const,
  list: (weddingId: string) => [...repurposingKeys.lists(), weddingId] as const,
  details: () => [...repurposingKeys.all, 'detail'] as const,
  detail: (id: string) => [...repurposingKeys.details(), id] as const,
  itemsWithInstructions: (weddingId: string) =>
    [...repurposingKeys.all, 'items-with-instructions', weddingId] as const,
};
```

---

## 9. Error Handling Pattern

All operations follow the constitution error handling pattern:

```typescript
try {
  const { data, error } = await supabase.from('repurposing_instructions')...;

  if (error) throw error;

  toast.success('Operation successful');
  return data;
} catch (error) {
  console.error('Error in operation:', error);
  toast.error('Operation failed. Please try again.');
  throw error;
}
```

---

## 10. Cache Invalidation

After mutations, invalidate related queries:

```typescript
// After create/update/delete
queryClient.invalidateQueries({ queryKey: repurposingKeys.list(weddingId) });

// After status update
queryClient.invalidateQueries({ queryKey: repurposingKeys.detail(instructionId) });
queryClient.invalidateQueries({ queryKey: repurposingKeys.list(weddingId) });
```
