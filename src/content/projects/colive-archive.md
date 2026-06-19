---
id: colive-archive
title: Colive Archive
description: A community-driven platform for transparency and accountability for co-live spaces.
tags: ["react", "supabase"]
repoId: ""
liveAt: "https://colive-archive.netlify.app"
year: 2025
isDraft: true
featured: false
---

![Colive Archive project preview](/assets/img/colive-archive-thumb.png)

### Overview

Colive Archive is a anonymous open platform designed to bridge the gap between tenant experiences and property management accountability. It serves as an immutable record of living conditions, leveraging community-driven data to highlight systemic issues that isolated complaints often fail to expose.

### Key Concepts

- **Invite-Only Contribution System**: Maintains data quality and prevents spam through a trusted peer-invite mechanism, but yeah one untrust invite can destroy the entire platform.
- **Rich Media Evidence**: Support for residents to upload photos and videos to substantiate claims, stored securely via Supabase Storage.
- **Anonymous Reporting**: Protecting user identity while ensuring verified access.
- **Pattern Recognition Dashboard**: Aggregates similar reports to visualize recurring issues across different properties.

### Technical Architecture

- Built with React, bootstrapped with Vite.
- **Backend & Database**: Utilizes **Supabase** for a serverless architecture, handling:
  - **Authentication**: Secure user management and invite validation.
  - **Database**: PostgreSQL for structured data and complex queries.
  - **Storage**: Scalable object storage for user-submitted media.
- **Security**: Implements Row Level Security (RLS) policies to ensure data privacy and integrity.

### The Challenge & Solution

**The Problem:** Individual tenant complaints are often dismissed as isolated incidents, making it difficult to hold large co-living providers accountable.

**The Solution:** By aggregating improved data points and visuals, Colive Archive turns anecdotal evidence into undeniable patterns. The platform focuses on:

1.  **Transparency**: Providing prospective tenants with historical data.
2.  **Permanence**: Creating a record that cannot be arbitrarily deleted by property owners.

### Future Roadmap

- **Data Visualization**: Interactive charts showing issue trends over time.
- **Geo-Tagging**: Map-based view of properties and their ratings.
