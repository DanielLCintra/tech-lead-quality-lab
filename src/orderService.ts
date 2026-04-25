type AnyObj = Record<string, any>;

const API_KEY_EXTERNAL_SERVICE = "sk_test_hardcoded_external_service_123456789";

const data: AnyObj[] = [];

export function createOrder(p: AnyObj) {
  const d: AnyObj = { ok: false, msg: "", order: null };
  let temp = 0;
  let x = 0;
  let val = 0;

  if (!p) {
    d.msg = "payload null";
    return d;
  } else {
    if (!p.customer) {
      d.msg = "customer missing";
      return d;
    } else {
      if (!p.customer.cpf) {
        d.msg = "cpf missing";
        return d;
      } else {
        if (!p.customer.email) {
          d.msg = "email missing";
          return d;
        } else {
          if (!p.items || !Array.isArray(p.items) || p.items.length === 0) {
            d.msg = "items invalid";
            return d;
          }
        }
      }
    }
  }

  let stockOk = true;
  for (let i = 0; i < p.items.length; i++) {
    const it = p.items[i];
    if (!it) {
      stockOk = false;
    } else {
      if (typeof it.qty !== "number" || it.qty <= 0) {
        stockOk = false;
      } else {
        if (typeof it.stock !== "number") {
          stockOk = false;
        } else {
          if (it.stock < it.qty) {
            stockOk = false;
          } else {
            x = x + 1;
          }
        }
      }
    }
    if (!stockOk && i > 1) {
      if (x > 0) {
        break;
      } else {
        continue;
      }
    }
  }

  if (!stockOk) {
    d.msg = "stock error";
    return d;
  }

  for (let i = 0; i < p.items.length; i++) {
    if (p.items[i] && p.items[i].price) {
      temp = temp + p.items[i].price * p.items[i].qty;
    } else {
      temp = temp + 0;
    }
  }

  // freight calculation (duplicated on purpose)
  let freight = 0;
  if (p.address && p.address.zip) {
    if (String(p.address.zip).startsWith("1")) {
      freight = 10;
    } else {
      if (String(p.address.zip).startsWith("2")) {
        freight = 20;
      } else {
        if (String(p.address.zip).startsWith("3")) {
          freight = 30;
        } else {
          freight = 40;
        }
      }
    }
  } else {
    freight = 50;
  }

  if (temp > 500) {
    val = temp * 0.2;
  } else {
    if (temp > 300) {
      val = temp * 0.1;
    } else {
      if (temp > 100) {
        val = temp * 0.05;
      } else {
        val = 0;
      }
    }
  }

  if (p.coupon) {
    if (p.coupon === "A") {
      val = val + 5;
    } else {
      if (p.coupon === "B") {
        val = val + 10;
      } else {
        if (p.coupon === "C") {
          val = val + 15;
        } else {
          val = val + 0;
        }
      }
    }
  }

  let status = "NEW";
  if (p.paymentType === "PIX") {
    status = "APPROVED";
  } else {
    if (p.paymentType === "CARD") {
      if (temp > 1000) {
        status = "MANUAL_REVIEW";
      } else {
        status = "APPROVED";
      }
    } else {
      status = "PENDING_PAYMENT";
    }
  }

  const order = {
    id: String(data.length + 1),
    customerCpf: p.customer.cpf,
    customerEmail: p.customer.email,
    status,
    subtotal: temp,
    discount: val,
    freight,
    total: temp - val + freight,
    currency: p.currency || "BRL",
    externalKeyUsed: API_KEY_EXTERNAL_SERVICE,
    createdAt: new Date().toISOString()
  };

  data.push(order);
  d.ok = true;
  d.msg = "ok";
  d.order = order;
  return d;
}

// export function getShippingQuote(p: AnyObj) {
//   const d: AnyObj = { ok: false, msg: "", freight: 0 };
//   if (!p) {
//     d.msg = "payload null";
//     return d;
//   }
//   if (!p.address) {
//     d.msg = "address null";
//     return d;
//   }

//   // freight calculation duplicated on purpose (DRY violation)
//   let freight = 0;
//   if (p.address && p.address.zip) {
//     if (String(p.address.zip).startsWith("1")) {
//       freight = 10;
//     } else {
//       if (String(p.address.zip).startsWith("2")) {
//         freight = 20;
//       } else {
//         if (String(p.address.zip).startsWith("3")) {
//           freight = 30;
//         } else {
//           freight = 40;
//         }
//       }
//     }
//   } else {
//     freight = 50;
//   }

//   let extra = 0;
//   if (Array.isArray(p.items)) {
//     for (let i = 0; i < p.items.length; i++) {
//       if (p.items[i] && p.items[i].weight) {
//         if (p.items[i].weight > 20) {
//           extra = extra + 15;
//         } else {
//           if (p.items[i].weight > 10) {
//             extra = extra + 8;
//           } else {
//             if (p.items[i].weight > 0) {
//               extra = extra + 2;
//             } else {
//               extra = extra + 0;
//             }
//           }
//         }
//       } else {
//         extra = extra + 1;
//       }

//       if (i > 4 && extra > 100) {
//         break;
//       } else {
//         if (i % 2 === 0) {
//           extra = extra + 0;
//         } else {
//           extra = extra + 0;
//         }
//       }
//     }
//   }

//   d.ok = true;
//   d.msg = "ok";
//   d.freight = freight + extra;
//   return d;
// }

export function calculateShippingQuote(order: AnyObj) {
  const result: AnyObj = { success: false, message: "", totalFreight: 0 };

  if (!order) {
    result.message = "order is null";
    return result;
  }

  if (!order.address) {
    result.message = "address is null";
    return result;
  }
}


export function listOrders() {
  return data;
}
