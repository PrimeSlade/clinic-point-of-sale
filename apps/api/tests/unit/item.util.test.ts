import { describe, it, expect } from 'vitest';
import { markIsChangedUnit } from '../../src/utils/item.util';

describe('markIsChangedUnit', () => {
  it('should mark unit as changed when quantity differs', () => {
    const oldUnits = [
      {
        id: 1,
        unitType: 'BOX',
        rate: 1,
        quantity: 10,
        purchasePrice: 100,
        isChanged: false,
      },
    ];
    const newUnits = [
      {
        id: 1,
        unitType: 'BOX',
        rate: 1,
        quantity: 20,
        purchasePrice: 100,
        isChanged: false,
      },
    ];

    const result = markIsChangedUnit(newUnits, oldUnits);

    expect(result[0].isChanged).toBe(true);
  });

  it('should not mark unit as changed when values are identical', () => {
    const units = [
      {
        id: 1,
        unitType: 'BOX',
        rate: 1,
        quantity: 10,
        purchasePrice: 100,
        isChanged: false,
      },
    ];

    const result = markIsChangedUnit([...units], [...units]);

    expect(result[0].isChanged).toBe(false);
  });

  it('should mark unit as changed when purchase price differs', () => {
    const oldUnits = [
      {
        id: 1,
        unitType: 'BOX',
        rate: 1,
        quantity: 10,
        purchasePrice: 100,
        isChanged: false,
      },
    ];
    const newUnits = [
      {
        id: 1,
        unitType: 'BOX',
        rate: 1,
        quantity: 10,
        purchasePrice: 150,
        isChanged: false,
      },
    ];

    const result = markIsChangedUnit(newUnits, oldUnits);

    expect(result[0].isChanged).toBe(true);
  });

  it('should mark unit as changed when rate differs', () => {
    const oldUnits = [
      {
        id: 1,
        unitType: 'BOX',
        rate: 1,
        quantity: 10,
        purchasePrice: 100,
        isChanged: false,
      },
    ];
    const newUnits = [
      {
        id: 1,
        unitType: 'BOX',
        rate: 2,
        quantity: 10,
        purchasePrice: 100,
        isChanged: false,
      },
    ];

    const result = markIsChangedUnit(newUnits, oldUnits);

    expect(result[0].isChanged).toBe(true);
  });

  it('should mark unit as changed when unit type differs', () => {
    const oldUnits = [
      {
        id: 1,
        unitType: 'BOX',
        rate: 1,
        quantity: 10,
        purchasePrice: 100,
        isChanged: false,
      },
    ];
    const newUnits = [
      {
        id: 1,
        unitType: 'PIECE',
        rate: 1,
        quantity: 10,
        purchasePrice: 100,
        isChanged: false,
      },
    ];

    const result = markIsChangedUnit(newUnits, oldUnits);

    expect(result[0].isChanged).toBe(true);
  });
});
