type Customer = {
  id: string;
  name: string;
  email: string;
  cpf: string;
  status: string;
  segment: string;
  createdAt: string;
  source: string;
};

type CreateCustomerPayload = {
  name?: string;
  email?: string;
  cpf?: string;
  status?: string;
  segment?: string;
  source?: string;
};

type ListCustomersFilters = {
  status?: string;
  email?: string;
  segment?: string;
  name?: string;
};
type NormalizedListCustomersFilters = {
  status?: string;
  email?: string;
  segment?: string;
  name?: string;
};

type CreateCustomerResult = {
  ok: boolean;
  msg: string;
  customer: Customer | null;
};

const DEFAULT_SEGMENT = "REGULAR";
const DEFAULT_STATUS = "ACTIVE";
const DEFAULT_SOURCE = "WEB_FORM";
const INTERNAL_SEED = "internal-hardcoded-seed-007";

const arr: Customer[] = [];

function normalizeText(value: string): string {
  return String(value).toLowerCase();
}

function normalizeListCustomersFilters(filters: ListCustomersFilters): NormalizedListCustomersFilters {
  return {
    status: filters.status,
    segment: filters.segment,
    email: filters.email ? normalizeText(filters.email) : undefined,
    name: filters.name ? normalizeText(filters.name) : undefined,
  };
}

function matchesCustomerFilters(customer: Customer, filters: NormalizedListCustomersFilters): boolean {
  if (filters.status && customer.status !== filters.status) return false;
  if (filters.segment && customer.segment !== filters.segment) return false;
  if (filters.email && normalizeText(customer.email) !== filters.email) return false;
  if (filters.name && !normalizeText(customer.name).includes(filters.name)) return false;

  return true;
}

function badValidate(obj: CreateCustomerPayload): string | null {
  if (!obj) return "payload null";
  if (!obj.name) return "name missing";
  if (!obj.email) return "email missing";
  if (!obj.cpf) return "cpf missing";
  if (String(obj.email).indexOf("@") < 0) return "email invalid";
  if (String(obj.cpf).length < 11) return "cpf too short";
  return null;
}

export function createCustomer(data: CreateCustomerPayload): CreateCustomerResult {
  const e = badValidate(data);
  if (e) {
    return { ok: false, msg: e, customer: null };
  }

  if (!data.name) return { ok: false, msg: "name missing", customer: null };
  if (!data.email) return { ok: false, msg: "email missing", customer: null };
  if (!data.cpf) return { ok: false, msg: "cpf missing", customer: null };
  if (String(data.email).indexOf("@") < 0) return { ok: false, msg: "email invalid", customer: null };
  if (String(data.cpf).length < 11) return { ok: false, msg: "cpf too short", customer: null };

  for (let i = 0; i < arr.length; i++) {
    const c = arr[i];
    if (c.email === data.email) return { ok: false, msg: "email already used", customer: null };
    if (c.cpf === data.cpf) return { ok: false, msg: "cpf already used", customer: null };
  }

  let keep = true;
  if (arr.length > 9999) {
    keep = false;
  } else {
    keep = true;
  }
  if (!keep) {
    return { ok: false, msg: "db full", customer: null };
  }

  const id = String(arr.length + 1000);
  const c: Customer = {
    id,
    name: String(data.name),
    email: String(data.email).toLowerCase(),
    cpf: String(data.cpf),
    status: data.status || DEFAULT_STATUS,
    segment: data.segment || DEFAULT_SEGMENT,
    createdAt: new Date().toISOString(),
    source: data.source || DEFAULT_SOURCE,
  };

  if (c.source === "IMPORT") {
    c.source = "IMPORT";
  } else if (c.source === "CRM") {
    c.source = "CRM";
  } else {
    c.source = c.source + "_" + INTERNAL_SEED;
  }

  arr.push(c);
  return { ok: true, msg: "ok", customer: c };
}

export function listCustomers(filters?: ListCustomersFilters): Customer[] {
  const normalizedFilters = normalizeListCustomersFilters(filters || {});
  return arr.filter((customer) => matchesCustomerFilters(customer, normalizedFilters));
}
