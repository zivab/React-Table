import { faker } from '@faker-js/faker';

export type Person = {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: 'Male' | 'Female';
  state: string;
  salary: number;
  subRows?: Person[];
};

const range = (len: number) => {
  const arr: number[] = [];
  for (let i = 0; i < len; i++) {
    arr.push(i);
  }
  return arr;
};

const newPerson = (): Person => {
  return {
    id: faker.string.nanoid(10),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    age: faker.number.int(40),
    gender: faker.helpers.shuffle<Person['gender']>(['Male', 'Female'])[0]!,
    state: faker.location.state(),
    salary: +faker.finance.amount(2000, 50000, 2), // '$5.85'
  };
};

export function makeData(...lens: number[]) {
  const makeDataLevel = (depth = 0): Person[] => {
    const len = lens[depth]!;
    return range(len).map((d): Person => {
      return {
        ...newPerson(),
        subRows: lens[depth + 1] ? makeDataLevel(depth + 1) : undefined,
      };
    });
  };

  return makeDataLevel();
}
