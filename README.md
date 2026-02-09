# StorageViz

A migration analysis dashboard for enterprise SharePoint migrations. Designed for executive presentations on large-format displays.

## Features

1. **Hero Stat Cards** - Total files, total size, duplicates, files older than 5 years, SharePoint-incompatible files
2. **Cumulative Migration Curve** - Interactive threshold slider showing what percentage of files/size you capture at any age cutoff
3. **File Age Histogram** - Distribution of files by age with dual-axis (count + size)
4. **Waste Summary Panel** - Duplicates, temp files, empty files, legacy formats with recoverable space
5. **Cost Simulator** - Live cost estimates for SharePoint vs Azure cold storage based on the threshold

## Tech Stack

- React 19 + Vite
- Recharts for visualization
- PapaParse for CSV parsing
- 100% client-side (no server, data never leaves your browser)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

1. Drag and drop a CSV file with the following columns:
   - `FullPath`, `FileName`, `Extension`, `SizeBytes`, `SizeKB`, `SizeMB`
   - `CreatedDate`, `ModifiedDate`, `AccessedDate`
   - `DaysSinceModified`, `DaysSinceAccessed`, `YearsSinceModified`
   - `FolderDepth`, `ParentFolder`, `Department`, `FileCategory`
   - `IsTempFile`, `IsEmptyFile`, `IsProbablyDuplicate`, `IsTemplateFile`
   - `IsMacroEnabled`, `MayBeLinkedDataSource`, `IsOutlookDataFile`
   - `SharePointCompatibility`, `PathLength`, `MigrationPriority`

2. Interact with the dashboard:
   - Drag the threshold line on the migration curve to adjust the age cutoff
   - Toggle between Azure Cool and Archive storage in the cost simulator
   - Adjust cost rates as needed

## Deployment

This app is configured for Railway deployment. Simply connect your repository to Railway and it will automatically build and deploy.

## Design

- Dark theme optimized for projectors
- Large typography readable from 15+ feet
- Minimal, professional aesthetic
- Smooth animations and transitions
