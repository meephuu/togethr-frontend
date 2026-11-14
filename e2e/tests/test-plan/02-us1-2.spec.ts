import { test } from '@playwright/test';
import { call } from '../../helpers/plan/api';
import { MSG, SOMSRI_REGISTRATION as TC10 } from '../../helpers/plan/data';
import { apiCase } from '../../helpers/plan/plan-test';
import { runTestSeed } from '../../helpers/plan/seed';
import { getState, setState } from '../../helpers/plan/state';

// US1-2 Provider registration (TC10–TC16), then the test seed
test.describe.configure({ mode: 'serial' });

test('TC10 - register somsri as a provider', apiCase('TC10', async (o, s) => {
  const res = await call(await s.anon(), 'POST', '/auth/register/provider', TC10);
  o.status(res, 201);
  const provider = res.body?.user?.provider ?? {};
  const providerOk = provider.idCard === TC10.idCard && provider.languages === TC10.languages;
  o.add(
    providerOk
      ? `body.user.provider includes idCard "${TC10.idCard}" and languages "${TC10.languages}"`
      : `body.user.provider ${JSON.stringify(res.body?.user?.provider)}`,
    providerOk,
  );

  const login = await call(await s.anon(), 'POST', '/auth/login', { email: TC10.email, password: TC10.password });
  const roles = login.body?.user?.roles;
  const rolesOk = login.status === 200 && JSON.stringify(roles) === '["CUSTOMER","PROVIDER"]';
  o.add(
    rolesOk
      ? 'provider and customer rows created (login returns roles CUSTOMER, PROVIDER)'
      : `login returns ${login.status}, roles ${JSON.stringify(roles)}`,
    rolesOk,
  );
}));

// As TC11 = as TC10 with username "somsri2", email "somsri2@gmail.com", idCard omitted
const { idCard: _omitted, ...tc11Base } = { ...TC10, username: 'somsri2', email: 'somsri2@gmail.com' };

const invalid: [string, string, Record<string, unknown>, string][] = [
  ['TC11', 'idCard omitted', {}, MSG.idCardRequired],
  ['TC12', 'idCard of 11 digits', { idCard: '11037001234' }, MSG.idCardInvalid],
  ['TC13', 'idCard with a letter', { idCard: '110370012345A' }, MSG.idCardInvalid],
  ['TC14', 'emergencyContactPhone of 9 digits', { idCard: '1103700123457', emergencyContactPhone: '089876543' }, MSG.emergencyPhoneInvalid],
];

for (const [tc, what, change, message] of invalid) {
  test(`${tc} - provider registration with ${what} is rejected`, apiCase(tc, async (o, s) => {
    const res = await call(await s.anon(), 'POST', '/auth/register/provider', { ...tc11Base, ...change });
    o.statusMessage(res, 400, message);
  }));
}

test('TC15 - provider registration without consent is rejected', apiCase('TC15', async (o, s) => {
  const { consent: _consent, ...data } = { ...tc11Base, idCard: '1103700123457' };
  const res = await call(await s.anon(), 'POST', '/auth/register/provider', data);
  o.statusMessage(res, 400, MSG.consentRequired);
}));

test('TC16 - provider registration with a taken email is rejected', apiCase('TC16', async (o, s) => {
  const res = await call(await s.anon(), 'POST', '/auth/register/provider', {
    ...TC10,
    username: 'somsri3',
    idCard: '1103700123458',
  });
  o.statusMessage(res, 409, MSG.emailTaken);
}));

// Not a test case: the plan runs `npm run seed:test` once after TC16.
test('Seed: npm run seed:test (after TC16)', async () => {
  const { ids, t2 } = runTestSeed();
  setState({ ids, tokens: { ...getState().tokens, T2: t2 } });
  console.log(`Seeded: ${Object.keys(ids).join(', ')}, T2`);
});
