# Travelbook Documentation

Complete documentation for the Travelbook engineering trip management application.

## 📚 Documentation Index

### Getting Started
- **Project README**: `/README.md` - Installation, setup, and quick start
- **Auth Setup Guide**: `/AUTH_SETUP.md` - Google OAuth configuration
- **Production Checklist**: `/PRODUCTION_AUTH_CHECKLIST.md` - Deployment steps

### Architecture
- **[Architecture Overview](architecture-overview.md)** - System design, tech stack, data model, request flow
- **[Feature Spec Guidelines](feature-spec-guidelines.md)** - How to write and maintain feature specs

### Feature Specifications

Each feature has a dedicated spec following the guidelines. Start with Architecture → Interfaces → Data.

1. **[Authentication](features/authentication/spec.md)**
   - Google OAuth login
   - Session management
   - Team isolation by email domain
   - Auto-user creation

2. **[Team Management](features/team-management/spec.md)**
   - Team member listing
   - Domain-based filtering
   - Auto-creation from auth
   - Color assignment

3. **[Trip Management](features/trip-management/spec.md)**
   - Trip CRUD operations
   - Status workflow
   - Team member assignment
   - Date management

4. **[Expense Tracking](features/expense-tracking/spec.md)**
   - Expense recording
   - Multi-currency support
   - Trip linkage
   - Categorization

5. **[Timeline Visualization](features/timeline-visualization/spec.md)**
   - Detailed day-by-day view
   - Aggregated day counts
   - Multiple time granularities
   - Period navigation

6. **[Reports & Analytics](features/reports-analytics/spec.md)**
   - Period-based reporting
   - Team member breakdowns
   - Expense analysis
   - Summary metrics

### Change History
- **[Updates V1](../UPDATES.md)** - Initial fixes (trip creation, timeline views)
- **[Updates V2](../UPDATES_V2.md)** - Aggregated timeline, data table, sidebar
- **[Updates V3](../UPDATES_V3.md)** - Aesthetic improvements, daily granularity
- **[Updates V4](../UPDATES_V4.md)** - Removal of salary information
- **[Updates V5](../UPDATES_V5_AUTH.md)** - Google authentication implementation
- **[Updates V6](../UPDATES_V6_TEAM_MEMBERS.md)** - Auto-add users, terminology changes
- **[Updates V7](../UPDATES_V7_STYLE_FIXES.md)** - Style and responsive design fixes

## 🎯 Quick Navigation

### For New Developers
1. Read [Architecture Overview](architecture-overview.md)
2. Review [Feature Spec Guidelines](feature-spec-guidelines.md)
3. Explore individual feature specs as needed
4. Check `/README.md` for local setup

### For Feature Development
1. Read relevant feature spec in `/docs/features/<feature>/spec.md`
2. Identify entrypoints and key components
3. Check stable contracts before making changes
4. Update spec in same PR as code changes

### For Deployment
1. Follow `/PRODUCTION_AUTH_CHECKLIST.md`
2. Configure Google OAuth (see `/AUTH_SETUP.md`)
3. Set environment variables in Vercel
4. Deploy via git push

### For Troubleshooting
1. Check feature spec for edge cases and limitations
2. Review [Architecture Overview](architecture-overview.md) for data flow
3. Verify environment configuration
4. Check Vercel logs for deployment issues

## 📋 Documentation Standards

### Feature Specs
- Follow `/docs/feature-spec-guidelines.md` exactly
- Keep specs current with code
- Update in same PR as feature changes
- Use bullets, not paragraphs
- Reference code, don't paste code

### Required Sections
1. Overview - What it does, scope
2. Architecture - Entrypoints, invariants, flow
3. Interfaces - APIs, inputs/outputs
4. Data and state - Models, lifecycle
5. Edge cases and limits - Handled and not handled
6. Tests - Coverage and scenarios
7. Last verified - Date and checks

### File Organization
```
/docs/
  README.md                          # This file (index)
  architecture-overview.md           # System-wide architecture
  feature-spec-guidelines.md         # Spec template rules
  /features/
    /<feature-name>/
      spec.md                        # Feature specification
```

## 🔄 Maintenance

### When to Update Docs

**Always update**:
- When adding new features
- When changing architecture
- When modifying stable contracts
- When changing data models
- When fixing significant bugs

**Update in same PR**:
- Feature spec when changing that feature
- Architecture overview for system-wide changes
- This index when adding/removing features

### Review Frequency
- Feature specs: On feature changes
- Architecture overview: Quarterly or on major changes
- Change history: On each release

## 🤝 Contributing to Docs

### Adding a New Feature
1. Create `/docs/features/<feature-name>/`
2. Create `spec.md` following guidelines
3. Add link to this README
4. Update architecture overview if needed

### Updating a Feature
1. Read current spec first
2. Make code changes
3. Update spec to match code
4. Update "Last verified" section
5. Include in same PR

### Splitting a Feature Spec
When a spec becomes too large:
1. Keep `spec.md` as index
2. Create sub-specs in same folder
3. Link from main spec
4. Follow same template for sub-specs

## 📊 Documentation Coverage

### ✅ Documented
- All 6 core features
- System architecture
- Authentication flow
- Data models
- Deployment process

### ⚠️ Partial Documentation
- Testing strategy (specs exist, no tests implemented)
- Error handling (documented per feature, no global strategy)
- Performance considerations (not documented)

### ❌ Not Documented
- Code style guide
- Component library guidelines
- API versioning (no API)
- Migration guides (no database)

## 🔗 External Resources

- **Next.js Docs**: https://nextjs.org/docs
- **NextAuth.js**: https://authjs.dev/
- **shadcn/ui**: https://ui.shadcn.com/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Vercel Deployment**: https://vercel.com/docs

## 📮 Questions?

- Check feature spec first
- Review architecture overview
- Consult change history
- Contact team via repository issues

---

**Documentation Version**: 1.0  
**Last Updated**: 2025-12-16  
**Maintained By**: Development Team

