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
  if (!String(obj.email).includes("@")) return "email invalid";
  if (String(obj.cpf).length < 11) return "cpf too short";
  return null;
}

export function createCustomer(data: CreateCustomerPayload): CreateCustomerResult {
  const validationError = badValidate(data);
  if (validationError) {
    return { ok: false, msg: validationError, customer: null };
  }

  const normalizedEmail = String(data.email).toLowerCase();
  const normalizedCpf = String(data.cpf);

  for (const existing of arr) {
    if (existing.email === normalizedEmail) return { ok: false, msg: "email already used", customer: null };
    if (existing.cpf === normalizedCpf) return { ok: false, msg: "cpf already used", customer: null };
  }

  if (arr.length > 9999) {
    return { ok: false, msg: "db full", customer: null };
  }

  const source = data.source || DEFAULT_SOURCE;
  const c: Customer = {
    id: String(arr.length + 1000),
    name: String(data.name),
    email: normalizedEmail,
    cpf: normalizedCpf,
    status: data.status || DEFAULT_STATUS,
    segment: data.segment || DEFAULT_SEGMENT,
    createdAt: new Date().toISOString(),
    source: source === "IMPORT" || source === "CRM" ? source : DEFAULT_SOURCE,
  };

  arr.push(c);
  return { ok: true, msg: "ok", customer: c };
}

export function listCustomers(filters?: ListCustomersFilters): Customer[] {
  const normalizedFilters = normalizeListCustomersFilters(filters || {});
  return arr.filter((customer) => matchesCustomerFilters(customer, normalizedFilters));
}
