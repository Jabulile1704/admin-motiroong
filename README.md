# MoTiroong Admin

Admin dashboard for MoTiroong. It uses the same Firebase backend as the
mobile app ([motiroong-backend](https://github.com/Jabulile1704/motiroong-backend)).

- **Reads** come live from Firestore (employees, sites, attendance,
  exceptions, audit log). `firestore.rules` allows admins and supervisors to
  read them.
- **Changes** go through the backend's callable functions. The functions
  check the caller's role and write the audit trail:

| Page | What it does | Backend |
|---|---|---|
| Dashboard | Live counts, hours logged, who's in by site, recent activity | Firestore reads |
| Attendance | Shifts with flags, filters, CSV export | Firestore reads |
| Sites | Add, edit and archive geofences | `upsertSite`, `archiveSite` |
| Employees | Approve or reject sign-ups; suspend, reactivate, change role | `approveEmployee`, `rejectEmployee`, `setEmployeeStatus`, `setEmployeeRole` |
| Exceptions | Approve or deny employees' explanations | `reviewException` |
| Audit Log | Every privileged action | Firestore reads (admins only) |

Only accounts with the **admin** or **supervisor** role get past the sign-in
page. Supervisors can review but can't approve sign-ups or edit sites; the
backend refuses those.

## Run it locally

1. Start the local backend (Firebase Emulator Suite) with `./start.sh` from
   the [Motirong-firebase](https://github.com/Jabulile1704/Motirong-firebase) repo.
2. Set up the dashboard:

   ```bash
   cp .env.example .env.local   # NEXT_PUBLIC_USE_EMULATORS=true
   npm install
   npm run dev
   ```

3. Open <http://localhost:3000> and sign in with an admin account. In the
   Motirong-firebase snapshot every account's password is `motirong-dev-2026`.

## The first admin

`approveEmployee` needs an admin, so the first admin is made by
`motiroong-backend/functions/src/scripts/bootstrap-admin.ts`. That script
sets the role and status in both the employee record and the sign-in token
claims, and Firestore rules read the claims. Editing the record in the
console alone isn't enough: the dashboard will say the account has no admin
access.

## Against the deployed project

Register a Web app in the Firebase console (Project settings → Your apps),
put its config in `.env.local`, and remove `NEXT_PUBLIC_USE_EMULATORS`.
Cloud Functions need the Blaze plan.
