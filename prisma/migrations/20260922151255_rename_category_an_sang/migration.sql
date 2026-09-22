-- Rename category "Cà phê/ ăn vặt/ ăn sáng..." to "Cà phê/ ăn vặt/ ăn sang..."
-- across all rows that reference it by string.
UPDATE "CategoryBaseline" SET category = 'Cà phê/ ăn vặt/ ăn sang...'
  WHERE category = 'Cà phê/ ăn vặt/ ăn sáng...';
UPDATE "Transaction" SET category = 'Cà phê/ ăn vặt/ ăn sang...'
  WHERE category = 'Cà phê/ ăn vặt/ ăn sáng...';
