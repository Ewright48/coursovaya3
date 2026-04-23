// Вспомогательная функция для расчёта цены одного букета
const calculateProductPrice = async (productId) => {
  const productQuery = `
    SELECT is_mix, discount, total_flowers
    FROM Products
    WHERE product_id = $1
  `;
  const productResult = await pool.query(productQuery, [productId]);
  const product = productResult.rows[0];
  
  if (!product) return 0;
  
  let basePrice = 0;
  
  if (!product.is_mix) {
    // Моно
    const flowerQuery = `
      SELECT f.price_per_flower, pf.quantity_in_mix
      FROM Product_Flowers pf
      JOIN Flowers f ON pf.flower_id = f.flower_id
      WHERE pf.product_id = $1
      LIMIT 1
    `;
    const flowerResult = await pool.query(flowerQuery, [productId]);
    
    if (flowerResult.rows[0]) {
      const { price_per_flower, quantity_in_mix } = flowerResult.rows[0];
      basePrice = price_per_flower * quantity_in_mix;
    }
  } else {
    // Микс
    const flowersQuery = `
      SELECT SUM(f.price_per_flower * pf.quantity_in_mix) as total
      FROM Product_Flowers pf
      JOIN Flowers f ON pf.flower_id = f.flower_id
      WHERE pf.product_id = $1
    `;
    const flowersResult = await pool.query(flowersQuery, [productId]);
    basePrice = parseFloat(flowersResult.rows[0].total) || 0;
  }
  
  const packagingQuery = `
    SELECT SUM(p.price) as total
    FROM Product_Packaging pp
    JOIN Packaging p ON pp.packaging_id = p.packaging_id
    WHERE pp.product_id = $1
  `;
  const packagingResult = await pool.query(packagingQuery, [productId]);
  basePrice += parseFloat(packagingResult.rows[0].total) || 0;
  
  const decorationQuery = `
    SELECT SUM(d.price * pd.quantity) as total
    FROM Product_Decoration pd
    JOIN Decoration d ON pd.decoration_id = d.decoration_id
    WHERE pd.product_id = $1
  `;
  const decorationResult = await pool.query(decorationQuery, [productId]);
  basePrice += parseFloat(decorationResult.rows[0].total) || 0;
  
  // Скидка
  const finalPrice = basePrice * (1 - product.discount / 100);
  
  return Math.floor(finalPrice);
};