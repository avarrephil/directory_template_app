# Supabase MCP Server Setup Guide

## ✅ Installation Complete

The Supabase MCP server has been successfully installed and configured.

## 📋 Next Steps (Action Required)

### 1. Configure Your Supabase Credentials

Edit the MCP configuration file with your actual Supabase credentials:

```bash
# Open the configuration file
open ~/.claude/mcp_config.json
```

Replace the placeholder values:
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["@supabase/mcp-server-supabase"],
      "env": {
        "SUPABASE_URL": "https://cdsbebylhziynjpzjfle.supabase.co",
        "SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkc2JlYnlsaHppeW5qcHpqZmxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTA5MTIsImV4cCI6MjA3MjYyNjkxMn0.5TwDljIUFwXAKOag7YPattLmufqb1wvdAok77ul-gk4EY"
      }
    }
  }
}
```

**Where to find your credentials:**
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the "Project URL" and "anon public" key

### 2. Run the Database Schema

Execute the SQL script in your Supabase SQL Editor:

1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `supabase-setup.sql`
4. Click "RUN" to execute

This will create:
- ✅ `uploaded_files` table (matches your TypeScript interface)
- ✅ Storage bucket `csv-files` for file uploads
- ✅ Proper security policies
- ✅ Performance indexes
- ✅ Sample data (optional)

### 3. Restart Claude Code

After updating the configuration:
1. Quit Claude Code completely
2. Restart the application
3. The MCP server should now be connected

## 🔍 Database Schema

The `uploaded_files` table matches your existing TypeScript interface:

```sql
CREATE TABLE uploaded_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                    -- matches UploadedFile.name
  size BIGINT NOT NULL,                  -- matches UploadedFile.size  
  uploaded_at TIMESTAMPTZ NOT NULL,      -- matches UploadedFile.uploadedAt
  status TEXT NOT NULL,                  -- matches UploadedFile.status
  storage_path TEXT,                     -- path in Supabase storage
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 📁 Storage Configuration

- **Bucket name**: `csv-files`
- **File path structure**: `uploads/{uuid}/{filename}`
- **Access**: Private (authentication required)

## 🧪 Testing MCP Connection

Once configured, you can test the connection by asking Claude Code:
- "Show me the uploaded_files table"
- "List all files in the uploaded_files table" 
- "Insert a test record into uploaded_files"

## 🚫 What NOT to Change

- ✅ Keep existing TypeScript interfaces unchanged
- ✅ Keep existing React components unchanged  
- ✅ Keep existing mock data in components
- ✅ Database schema perfectly matches existing code

## ⚡ Ready for Future Implementation

When you're ready to implement the TODO items in your components:
- File upload logic can now store metadata in `uploaded_files` table
- CSV files can be stored in Supabase storage bucket
- File processing status can be tracked in the database
- All existing UI components will work seamlessly

The foundation is now ready for your business directory app!