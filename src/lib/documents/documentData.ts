/**
 * Document Data Aggregation
 * Feature: 017-document-generation
 *
 * Functions for aggregating wedding data from existing Supabase tables
 * for document generation. All queries are read-only.
 */

import { supabase } from '@/lib/supabase';
import type {
  DocumentSection,
  FunctionSheetData,
  SectionCounts,
  WeddingOverviewData,
  EventData,
  GuestData,
  AttendanceData,
  MealSelectionSummary,
  BarOrderData,
  WeddingItemData,
  RepurposingData,
  StaffRequirementData,
  TransportData,
  StationeryData,
  BeautyServiceData,
  AccommodationData,
  ShoppingItemData,
  BudgetData,
  VendorData,
  TaskData,
  VendorBriefData,
} from '@/types/document';

/**
 * Aggregates wedding data for selected sections
 *
 * @param weddingId - UUID of the wedding
 * @param sections - Array of selected section identifiers
 * @returns Promise resolving to FunctionSheetData object
 * @throws Error if wedding not found or query fails
 *
 * Performance: Should complete in <2 seconds for typical wedding
 * Only fetches data for selected sections (optimization)
 */
export async function aggregateDocumentData(
  weddingId: string,
  sections: DocumentSection[]
): Promise<FunctionSheetData> {
  // Always fetch wedding (needed for header)
  const { data: wedding, error: weddingError } = await supabase
    .from('weddings')
    .select('*')
    .eq('id', weddingId)
    .single();

  if (weddingError) throw new Error(`Failed to fetch wedding: ${weddingError.message}`);
  if (!wedding) throw new Error('Wedding not found');

  const data: FunctionSheetData = { wedding: wedding as WeddingOverviewData };
  const promises: Promise<void>[] = [];

  // Helper to convert PromiseLike to Promise
  const toPromise = <T>(promiseLike: PromiseLike<T>): Promise<T> =>
    Promise.resolve(promiseLike);

  // Event Summary and Timeline need events
  if (sections.includes('event_summary') || sections.includes('timeline')) {
    promises.push(
      toPromise(
        supabase
          .from('events')
          .select('*')
          .eq('wedding_id', weddingId)
          .order('event_order')
          .then(({ data: events, error }) => {
            if (error) throw new Error(`Failed to fetch events: ${error.message}`);
            data.events = (events ?? []) as EventData[];
          })
      )
    );
  }

  // Guest List, Attendance Matrix, Meal Selections need guests
  if (
    sections.includes('guest_list') ||
    sections.includes('attendance_matrix') ||
    sections.includes('meal_selections')
  ) {
    promises.push(
      toPromise(supabase
        .from('guests')
        .select('*')
        .eq('wedding_id', weddingId)
        .order('name')
        .then(({ data: guests, error }) => {
          if (error) throw new Error(`Failed to fetch guests: ${error.message}`);
          data.guests = (guests ?? []) as GuestData[];

          // Aggregate meal selections if needed
          if (sections.includes('meal_selections') && data.guests) {
            data.mealSelections = aggregateMealSelections(data.guests);
          }
        }))
    );
  }

  // Attendance Matrix needs guest_event_attendance
  if (sections.includes('attendance_matrix')) {
    promises.push(
      toPromise(supabase
        .from('guest_event_attendance')
        .select(`
          *,
          guests!inner(name, guest_type),
          events!inner(event_name, event_order)
        `)
        .eq('guests.wedding_id', weddingId)
        .then(({ data: attendance, error }) => {
          if (error) throw new Error(`Failed to fetch attendance: ${error.message}`);
          data.attendance = (attendance ?? []).map((a) => ({
            guest_id: a.guest_id,
            guest_name: a.guests?.name ?? '',
            guest_type: a.guests?.guest_type ?? '',
            event_id: a.event_id,
            event_name: a.events?.event_name ?? '',
            event_order: a.events?.event_order ?? 0,
            attending: a.attending,
            shuttle_to_event: a.shuttle_to_event,
            shuttle_from_event: a.shuttle_from_event,
          })) as AttendanceData[];
        }))
    );
  }

  // Bar Orders
  if (sections.includes('bar_orders')) {
    promises.push(
      toPromise(supabase
        .from('bar_orders')
        .select(`
          *,
          events(event_name),
          bar_order_items(*)
        `)
        .eq('wedding_id', weddingId)
        .then(({ data: barOrders, error }) => {
          if (error) throw new Error(`Failed to fetch bar orders: ${error.message}`);
          data.barOrders = (barOrders ?? []).map((bo) => ({
            id: bo.id,
            event_id: bo.event_id,
            event_name: bo.events?.event_name ?? '',
            guest_count_adults: bo.guest_count_adults,
            guest_count_children: bo.guest_count_children,
            event_duration_hours: bo.event_duration_hours,
            total_servings_per_person: bo.total_servings_per_person,
            items: bo.bar_order_items ?? [],
          })) as BarOrderData[];
        }))
    );
  }

  // Furniture & Equipment
  if (sections.includes('furniture_equipment')) {
    promises.push(
      toPromise(supabase
        .from('wedding_items')
        .select(`
          *,
          wedding_item_event_quantities(
            *,
            events(event_name)
          )
        `)
        .eq('wedding_id', weddingId)
        .order('category')
        .then(({ data: items, error }) => {
          if (error) throw new Error(`Failed to fetch wedding items: ${error.message}`);
          data.weddingItems = (items ?? []).map((item) => ({
            id: item.id,
            category: item.category,
            description: item.description,
            aggregation_method: item.aggregation_method,
            number_available: item.number_available,
            total_required: item.total_required,
            cost_per_unit: item.cost_per_unit,
            total_cost: item.total_cost,
            supplier_name: item.supplier_name,
            eventQuantities: (item.wedding_item_event_quantities ?? []).map((eq: { event_id: string; quantity_required: number; events?: { event_name: string } }) => ({
              event_id: eq.event_id,
              event_name: eq.events?.event_name ?? '',
              quantity_required: eq.quantity_required,
            })),
          })) as WeddingItemData[];
        }))
    );
  }

  // Repurposing Instructions
  if (sections.includes('repurposing')) {
    promises.push(
      toPromise(supabase
        .from('repurposing_instructions')
        .select(`
          *,
          wedding_items(description),
          from_event:events!repurposing_instructions_from_event_id_fkey(event_name),
          to_event:events!repurposing_instructions_to_event_id_fkey(event_name)
        `)
        .eq('wedding_id', weddingId)
        .order('pickup_time')
        .then(({ data: repurposing, error }) => {
          if (error) throw new Error(`Failed to fetch repurposing: ${error.message}`);
          data.repurposing = (repurposing ?? []).map((r) => ({
            id: r.id,
            item_description: r.wedding_items?.description ?? '',
            from_event_name: r.from_event?.event_name ?? '',
            to_event_name: r.to_event?.event_name ?? '',
            pickup_location: r.pickup_location,
            pickup_time: r.pickup_time,
            dropoff_location: r.dropoff_location,
            dropoff_time: r.dropoff_time,
            responsible_party: r.responsible_party,
            handling_notes: r.handling_notes,
            status: r.status,
          })) as RepurposingData[];
        }))
    );
  }

  // Staff Requirements
  if (sections.includes('staff_requirements')) {
    promises.push(
      toPromise(supabase
        .from('staff_requirements')
        .select(`
          *,
          events(event_name),
          vendors(company_name)
        `)
        .eq('wedding_id', weddingId)
        .then(({ data: staff, error }) => {
          if (error) throw new Error(`Failed to fetch staff requirements: ${error.message}`);
          data.staffRequirements = (staff ?? []).map((s) => ({
            id: s.id,
            event_id: s.event_id,
            event_name: s.events?.event_name ?? '',
            vendor_name: s.vendors?.company_name ?? null,
            supervisors: s.supervisors,
            waiters: s.waiters,
            bartenders: s.bartenders,
            runners: s.runners,
            scullers: s.scullers,
            total_staff: s.total_staff,
            staff_notes: s.staff_notes,
          })) as StaffRequirementData[];
        }))
    );
  }

  // Transportation
  if (sections.includes('transportation')) {
    promises.push(
      toPromise(supabase
        .from('shuttle_transport')
        .select(`
          *,
          events(event_name)
        `)
        .eq('wedding_id', weddingId)
        .order('collection_time')
        .then(({ data: transport, error }) => {
          if (error) throw new Error(`Failed to fetch transportation: ${error.message}`);
          data.transportation = (transport ?? []).map((t) => ({
            id: t.id,
            event_id: t.event_id,
            event_name: t.events?.event_name ?? '',
            transport_type: t.transport_type,
            shuttle_name: t.shuttle_name,
            collection_location: t.collection_location,
            dropoff_location: t.dropoff_location,
            collection_time: t.collection_time,
            number_of_guests: t.number_of_guests,
            guest_names: t.guest_names,
          })) as TransportData[];
        }))
    );
  }

  // Stationery
  if (sections.includes('stationery')) {
    promises.push(
      toPromise(supabase
        .from('stationery_items')
        .select('*')
        .eq('wedding_id', weddingId)
        .order('item_name')
        .then(({ data: stationery, error }) => {
          if (error) throw new Error(`Failed to fetch stationery: ${error.message}`);
          data.stationery = (stationery ?? []) as StationeryData[];
        }))
    );
  }

  // Beauty Services
  if (sections.includes('beauty_services')) {
    promises.push(
      toPromise(supabase
        .from('beauty_services')
        .select(`
          *,
          vendors(company_name)
        `)
        .eq('wedding_id', weddingId)
        .order('appointment_time')
        .then(({ data: beauty, error }) => {
          if (error) throw new Error(`Failed to fetch beauty services: ${error.message}`);
          data.beautyServices = (beauty ?? []).map((b) => ({
            id: b.id,
            vendor_name: b.vendors?.company_name ?? null,
            person_name: b.person_name,
            role: b.role,
            requires_hair: b.requires_hair,
            requires_makeup: b.requires_makeup,
            appointment_time: b.appointment_time,
          })) as BeautyServiceData[];
        }))
    );
  }

  // Accommodation
  if (sections.includes('accommodation')) {
    promises.push(
      toPromise(supabase
        .from('cottages')
        .select(`
          *,
          cottage_rooms(*)
        `)
        .eq('wedding_id', weddingId)
        .order('cottage_name')
        .then(({ data: cottages, error }) => {
          if (error) throw new Error(`Failed to fetch accommodation: ${error.message}`);
          data.accommodation = {
            cottages: (cottages ?? []).map((c) => ({
              id: c.id,
              cottage_name: c.cottage_name,
              charge_per_room_per_night: c.charge_per_room_per_night,
              rooms: c.cottage_rooms ?? [],
            })),
          } as AccommodationData;
        }))
    );
  }

  // Shopping List
  if (sections.includes('shopping_list')) {
    promises.push(
      toPromise(supabase
        .from('shopping_list_items')
        .select('*')
        .eq('wedding_id', weddingId)
        .order('category')
        .then(({ data: shopping, error }) => {
          if (error) throw new Error(`Failed to fetch shopping list: ${error.message}`);
          data.shoppingList = (shopping ?? []) as ShoppingItemData[];
        }))
    );
  }

  // Budget Summary
  if (sections.includes('budget_summary')) {
    promises.push(
      toPromise(supabase
        .from('budget_categories')
        .select(`
          *,
          budget_line_items(
            *,
            vendors(company_name)
          )
        `)
        .eq('wedding_id', weddingId)
        .order('category_name')
        .then(({ data: categories, error }) => {
          if (error) throw new Error(`Failed to fetch budget: ${error.message}`);
          const cats = (categories ?? []).map((c) => ({
            id: c.id,
            category_name: c.category_name,
            projected_amount: c.projected_amount,
            actual_amount: c.actual_amount,
            variance: c.variance,
            lineItems: (c.budget_line_items ?? []).map((li: { id: string; item_description: string; vendors?: { company_name: string }; projected_cost: number; actual_cost: number | null; payment_status: string }) => ({
              id: li.id,
              item_description: li.item_description,
              vendor_name: li.vendors?.company_name ?? null,
              projected_cost: li.projected_cost,
              actual_cost: li.actual_cost,
              payment_status: li.payment_status,
            })),
          }));
          data.budget = {
            categories: cats,
            totals: {
              projected: cats.reduce((sum, c) => sum + (c.projected_amount || 0), 0),
              actual: cats.reduce((sum, c) => sum + (c.actual_amount || 0), 0),
              variance: cats.reduce((sum, c) => sum + (c.variance || 0), 0),
            },
          } as BudgetData;
        }))
    );
  }

  // Vendor Contacts
  if (sections.includes('vendor_contacts')) {
    promises.push(
      toPromise(supabase
        .from('vendors')
        .select(`
          *,
          vendor_payment_schedule(*)
        `)
        .eq('wedding_id', weddingId)
        .order('vendor_type')
        .then(({ data: vendors, error }) => {
          if (error) throw new Error(`Failed to fetch vendors: ${error.message}`);
          data.vendors = (vendors ?? []).map((v) => ({
            id: v.id,
            vendor_type: v.vendor_type,
            company_name: v.company_name,
            contact_name: v.contact_name,
            contact_email: v.contact_email,
            contact_phone: v.contact_phone,
            address: v.address,
            website: v.website,
            contract_signed: v.contract_signed,
            contract_date: v.contract_date,
            contract_value: v.contract_value,
            payments: v.vendor_payment_schedule ?? [],
          })) as VendorData[];
        }))
    );
  }

  // Timeline (pre/post wedding tasks)
  if (sections.includes('timeline')) {
    promises.push(
      toPromise(supabase
        .from('pre_post_wedding_tasks')
        .select('*')
        .eq('wedding_id', weddingId)
        .order('due_date')
        .order('due_time')
        .then(({ data: tasks, error }) => {
          if (error) throw new Error(`Failed to fetch tasks: ${error.message}`);
          data.tasks = (tasks ?? []) as TaskData[];
        }))
    );
  }

  await Promise.all(promises);

  return data;
}

/**
 * Gets counts for all sections (for preview display)
 *
 * @param weddingId - UUID of the wedding
 * @returns Promise resolving to SectionCounts object
 *
 * Performance: Should complete in <500ms (parallel count queries)
 * Used for UI preview before generation
 */
export async function getSectionCounts(weddingId: string): Promise<SectionCounts> {
  const [
    { count: events },
    { count: guests },
    { count: vendors },
    { count: barOrders },
    { count: weddingItems },
    { count: repurposingInstructions },
    { count: staffPositions },
    { count: shuttles },
    { count: stationeryItems },
    { count: beautyAppointments },
    { count: cottages },
    { count: rooms },
    { count: shoppingItems },
    { count: budgetCategories },
    { count: tasks },
    guestCounts,
  ] = await Promise.all([
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('wedding_id', weddingId),
    supabase.from('guests').select('*', { count: 'exact', head: true }).eq('wedding_id', weddingId),
    supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('wedding_id', weddingId),
    supabase.from('bar_orders').select('*', { count: 'exact', head: true }).eq('wedding_id', weddingId),
    supabase.from('wedding_items').select('*', { count: 'exact', head: true }).eq('wedding_id', weddingId),
    supabase.from('repurposing_instructions').select('*', { count: 'exact', head: true }).eq('wedding_id', weddingId),
    supabase.from('staff_requirements').select('*', { count: 'exact', head: true }).eq('wedding_id', weddingId),
    supabase.from('shuttle_transport').select('*', { count: 'exact', head: true }).eq('wedding_id', weddingId),
    supabase.from('stationery_items').select('*', { count: 'exact', head: true }).eq('wedding_id', weddingId),
    supabase.from('beauty_services').select('*', { count: 'exact', head: true }).eq('wedding_id', weddingId),
    supabase.from('cottages').select('*', { count: 'exact', head: true }).eq('wedding_id', weddingId),
    supabase.from('cottage_rooms').select('*, cottages!inner(wedding_id)', { count: 'exact', head: true }).eq('cottages.wedding_id', weddingId),
    supabase.from('shopping_list_items').select('*', { count: 'exact', head: true }).eq('wedding_id', weddingId),
    supabase.from('budget_categories').select('*', { count: 'exact', head: true }).eq('wedding_id', weddingId),
    supabase.from('pre_post_wedding_tasks').select('*', { count: 'exact', head: true }).eq('wedding_id', weddingId),
    // Get guest type breakdown
    supabase
      .from('guests')
      .select('guest_type')
      .eq('wedding_id', weddingId)
      .then(({ data }) => {
        const adults = (data ?? []).filter((g) => g.guest_type === 'adult').length;
        const children = (data ?? []).filter((g) => g.guest_type === 'child').length;
        return { adults, children };
      }),
  ]);

  return {
    events: events ?? 0,
    guests: guests ?? 0,
    adultsGuests: guestCounts.adults,
    childrenGuests: guestCounts.children,
    vendors: vendors ?? 0,
    barOrders: barOrders ?? 0,
    weddingItems: weddingItems ?? 0,
    repurposingInstructions: repurposingInstructions ?? 0,
    staffPositions: staffPositions ?? 0,
    shuttles: shuttles ?? 0,
    stationeryItems: stationeryItems ?? 0,
    beautyAppointments: beautyAppointments ?? 0,
    cottages: cottages ?? 0,
    rooms: rooms ?? 0,
    shoppingItems: shoppingItems ?? 0,
    budgetCategories: budgetCategories ?? 0,
    tasks: tasks ?? 0,
  };
}

/**
 * Aggregates vendor data for Vendor Brief generation
 *
 * @param vendorId - UUID of the vendor
 * @param weddingId - UUID of the wedding
 * @returns Promise resolving to VendorBriefData object
 * @throws Error if vendor or wedding not found
 */
export async function aggregateVendorBriefData(
  vendorId: string,
  weddingId: string
): Promise<VendorBriefData> {
  const [vendorResult, weddingResult, eventsResult, paymentsResult] = await Promise.all([
    supabase
      .from('vendors')
      .select('*')
      .eq('id', vendorId)
      .single(),
    supabase
      .from('weddings')
      .select('*')
      .eq('id', weddingId)
      .single(),
    supabase
      .from('events')
      .select('*')
      .eq('wedding_id', weddingId)
      .order('event_order'),
    supabase
      .from('vendor_payment_schedule')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('due_date'),
  ]);

  if (vendorResult.error) throw new Error(`Failed to fetch vendor: ${vendorResult.error.message}`);
  if (!vendorResult.data) throw new Error('Vendor not found');

  if (weddingResult.error) throw new Error(`Failed to fetch wedding: ${weddingResult.error.message}`);
  if (!weddingResult.data) throw new Error('Wedding not found');

  return {
    vendor: {
      ...vendorResult.data,
      payments: paymentsResult.data ?? [],
    } as VendorData,
    wedding: weddingResult.data as WeddingOverviewData,
    events: (eventsResult.data ?? []) as EventData[],
    payments: (paymentsResult.data ?? []) as VendorBriefData['payments'],
    specialInstructions: vendorResult.data.special_instructions ?? null,
  };
}

/**
 * Checks whether section data is non-empty
 *
 * @param sectionData - Array or object to check
 * @returns true if data exists and is non-empty
 */
export function shouldIncludeSection(sectionData: unknown[] | Record<string, unknown> | undefined): boolean {
  if (!sectionData) return false;
  if (Array.isArray(sectionData)) return sectionData.length > 0;
  if (typeof sectionData === 'object') {
    // For objects like AccommodationData, check if they have content
    const values = Object.values(sectionData);
    return values.some((v) => Array.isArray(v) ? v.length > 0 : !!v);
  }
  return false;
}

/**
 * Aggregates meal selection data from guests
 */
function aggregateMealSelections(guests: GuestData[]): MealSelectionSummary {
  const starters: Record<string, number> = {};
  const mains: Record<string, number> = {};
  const desserts: Record<string, number> = {};
  const dietaryRestrictions: Record<string, number> = {};

  for (const guest of guests) {
    if (guest.starter_choice) {
      starters[guest.starter_choice] = (starters[guest.starter_choice] || 0) + 1;
    }
    if (guest.main_choice) {
      mains[guest.main_choice] = (mains[guest.main_choice] || 0) + 1;
    }
    if (guest.dessert_choice) {
      desserts[guest.dessert_choice] = (desserts[guest.dessert_choice] || 0) + 1;
    }
    if (guest.dietary_restrictions) {
      const restrictions = guest.dietary_restrictions.split(',').map((r) => r.trim());
      for (const restriction of restrictions) {
        if (restriction) {
          dietaryRestrictions[restriction] = (dietaryRestrictions[restriction] || 0) + 1;
        }
      }
    }
  }

  return { starters, mains, desserts, dietaryRestrictions };
}
