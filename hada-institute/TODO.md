# TODO — Hada Institute Admin CMS Upgrade

## Step 1 — Prepare CMS dashboard data
- [ ] Extend `src/lib/data.ts` with:
  - [ ] `getAdminCmsDashboardOverview()` (draft/published counts by type)
  - [ ] `getAdminRecentUploads()` (recent Product + SubjectNote uploads)
  - [ ] `getAdminContentStatistics()` (featured/active counts + last change summary)
  - [ ] `getAdminRecentActivity()` (audit timeline)

## Step 2 — Build reusable CMS dashboard components
- [ ] Create `src/components/admin/dashboard/` components:
  - [ ] `content-quick-actions.tsx`
  - [ ] `drafts-overview.tsx`
  - [ ] `recent-uploads.tsx`
  - [ ] `content-statistics.tsx`
  - [ ] `recent-activity-timeline.tsx`
  - [ ] Shared small UI helpers as needed (e.g., status pills)

## Step 3 — Replace admin dashboard UI
- [ ] Rewrite `src/app/admin/page.tsx` into a centralized “Content Dashboard”
- [ ] Ensure it composes the new components
- [ ] Use responsive Tailwind layout + visual hierarchy

## Step 4 — Publish / unpublish workflows
- [ ] Determine best reuse of existing PATCH endpoints for each entity type
- [ ] If needed, add `src/app/api/admin/cms/publish/route.ts`
- [ ] Add client-side actions on dashboard tables/cards (publish/unpublish)

## Step 5 — Validation & quality
- [ ] Run `npm run lint` / biome check
- [ ] Run TypeScript build
- [ ] Manually verify:
  - [ ] Dashboard loads
  - [ ] Timeline renders
  - [ ] Publish toggles update DB and logs
  - [ ] Responsive layout

