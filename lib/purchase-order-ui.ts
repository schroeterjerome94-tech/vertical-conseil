export type PurchaseOrderFields = {
  street: string;
  number: string;
  npa: string;
  locality: string;
  access: string;
  orderNumber: string;
  object: string;
  notes: string;
};

export const EMPTY_PURCHASE_ORDER_FIELDS: PurchaseOrderFields = {
  street: "",
  number: "",
  npa: "",
  locality: "",
  access: "",
  orderNumber: "",
  object: "",
  notes: "",
};
