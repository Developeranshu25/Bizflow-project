/**
 * GST Calculation Service
 * Formula: Total = Subtotal + CGST + SGST
 * CGST = Subtotal * (cgst_rate / 100)
 * SGST = Subtotal * (sgst_rate / 100)
 */

exports.calculate = (items, cgstRate = 9, sgstRate = 9) => {
  const subtotal = items.reduce((sum, item) => {
    return sum + parseFloat(item.rate) * parseInt(item.quantity);
  }, 0);

  const cgstAmount = parseFloat((subtotal * cgstRate / 100).toFixed(2));
  const sgstAmount = parseFloat((subtotal * sgstRate / 100).toFixed(2));
  const total = parseFloat((subtotal + cgstAmount + sgstAmount).toFixed(2));

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    cgstRate: parseFloat(cgstRate),
    sgstRate: parseFloat(sgstRate),
    cgstAmount,
    sgstAmount,
    total
  };
};

exports.generateInvoiceNo = (lastId) => {
  const date = new Date();
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const seq = String((lastId || 0) + 1).padStart(4, '0');
  return `BF${yy}${mm}-${seq}`;
};
