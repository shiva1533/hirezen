import TopNavBar from "@/components/layout/TopNavBar";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Database, Layers, Lock, Zap, Code, FileCode, Cloud, Cpu, Network, Shield } from "lucide-react";

const Knowledge = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNavBar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="ml-0 lg:ml-56 flex-1 p-4 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Technology Documentation</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Comprehensive guide to the system architecture and implementation
            </p>
          </div>

          <div className="space-y-6">
            {/* System Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  <CardTitle>System Architecture Overview</CardTitle>
                </div>
                <CardDescription>High-level architecture and technology stack</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  This is a full-stack recruitment management system built with modern web technologies. 
                  The application follows a client-server architecture with a React frontend and Supabase backend.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Code className="h-4 w-4 text-primary" />
                      Frontend Stack
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                      <li>• React 18 with TypeScript</li>
                      <li>• Vite (build tool)</li>
                      <li>• Tailwind CSS + shadcn/ui</li>
                      <li>• React Router (routing)</li>
                      <li>• TanStack Query (data fetching)</li>
                      <li>• React Hook Form + Zod (forms)</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Cloud className="h-4 w-4 text-primary" />
                      Backend Stack
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                      <li>• Supabase (PostgreSQL)</li>
                      <li>• Supabase Auth (authentication)</li>
                      <li>• Supabase Storage (file storage)</li>
                      <li>• Edge Functions (Deno runtime)</li>
                      <li>• Row Level Security (RLS)</li>
                      <li>• Lovable AI Gateway</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Frontend Architecture */}
            <Collapsible>
              <Card>
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileCode className="h-5 w-5 text-primary" />
                        <CardTitle>Frontend Architecture</CardTitle>
                      </div>
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardDescription>Component structure, routing, and state management</CardDescription>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4 pt-0">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Component Organization</h4>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                          <li><Badge variant="outline" className="mr-2">pages/</Badge>Route-level components (Dashboard, Jobs, Candidates, etc.)</li>
                          <li><Badge variant="outline" className="mr-2">components/</Badge>Reusable UI components organized by feature</li>
                          <li><Badge variant="outline" className="mr-2">components/ui/</Badge>Base shadcn/ui components</li>
                          <li><Badge variant="outline" className="mr-2">components/layout/</Badge>Layout components (Sidebar, TopNavBar)</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Routing System</h4>
                        <p className="text-sm text-muted-foreground">
                          Uses React Router v6 with route definitions in <code className="text-xs bg-muted px-1 py-0.5 rounded">src/main.tsx</code>. 
                          Protected routes require authentication, public routes like job applications are accessible without login.
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-2">State Management</h4>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                          <li>• <strong>TanStack Query:</strong> Server state and data fetching with caching</li>
                          <li>• <strong>Zustand:</strong> Lightweight client state (if needed)</li>
                          <li>• <strong>React Hook Form:</strong> Form state management</li>
                          <li>• <strong>React Context:</strong> Theme and authentication state</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-2">Design System</h4>
                        <p className="text-sm text-muted-foreground">
                          Utilizes semantic design tokens defined in <code className="text-xs bg-muted px-1 py-0.5 rounded">index.css</code> and 
                          <code className="text-xs bg-muted px-1 py-0.5 rounded ml-1">tailwind.config.ts</code>. All colors use HSL format with 
                          CSS variables for theming support (--primary, --secondary, --accent, etc.).
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Backend Architecture */}
            <Collapsible>
              <Card>
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-primary" />
                        <CardTitle>Backend Architecture</CardTitle>
                      </div>
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardDescription>Database, edge functions, and serverless infrastructure</CardDescription>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4 pt-0">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Database Schema</h4>
                        <p className="text-sm text-muted-foreground mb-2">PostgreSQL database with the following main tables:</p>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                          <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">jobs</code> - Job postings and requisitions</li>
                          <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">candidates</code> - Candidate profiles and applications</li>
                          <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">ai_interviews</code> - AI-powered interview data</li>
                          <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">pipeline_activity_logs</code> - Recruitment pipeline tracking</li>
                          <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">profiles</code> - User profile information</li>
                          <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">user_roles</code> - Role-based access control</li>
                          <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">job_templates</code> - Reusable job templates</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-2">Edge Functions</h4>
                        <p className="text-sm text-muted-foreground mb-2">Serverless functions running on Deno runtime:</p>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                          <li>• <strong>AI Analysis:</strong> analyze-candidate-match, analyze-interview-video</li>
                          <li>• <strong>Document Processing:</strong> parse-pdf, parse-resume, extract-job-from-pdf</li>
                          <li>• <strong>Interview Management:</strong> generate-interview-questions, evaluate-interview-answers</li>
                          <li>• <strong>Matching:</strong> match-candidate-to-jobs, match-all-candidates-to-job</li>
                          <li>• <strong>Communication:</strong> send-candidate-email</li>
                          <li>• <strong>Batch Operations:</strong> batch-upload-resumes</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-2">File Storage</h4>
                        <p className="text-sm text-muted-foreground">
                          Supabase Storage buckets for resumes, videos, and attachments. Files are organized by type and 
                          candidate/user ID with proper access control policies.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Authentication & Security */}
            <Collapsible>
              <Card>
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-primary" />
                        <CardTitle>Authentication & Security</CardTitle>
                      </div>
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardDescription>User authentication, authorization, and data security</CardDescription>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4 pt-0">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Authentication Flow</h4>
                        <ol className="text-sm text-muted-foreground space-y-1 ml-4 list-decimal">
                          <li>User signs up/logs in via Supabase Auth</li>
                          <li>JWT token is issued and stored in browser</li>
                          <li>Token is automatically included in all API requests</li>
                          <li>Backend validates token and enforces RLS policies</li>
                        </ol>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-2">Role-Based Access Control (RBAC)</h4>
                        <p className="text-sm text-muted-foreground mb-2">Three primary roles with different permissions:</p>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                          <li>• <Badge className="mr-2">Admin</Badge>Full system access, manage users, delete records</li>
                          <li>• <Badge className="mr-2">Recruiter</Badge>Manage jobs and candidates, view applications</li>
                          <li>• <Badge className="mr-2">User</Badge>Basic access, view own profile and notifications</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-2">Row Level Security (RLS)</h4>
                        <p className="text-sm text-muted-foreground">
                          Database-level security policies ensure users can only access data they're authorized to see. 
                          Policies are defined using PostgreSQL functions like <code className="text-xs bg-muted px-1 py-0.5 rounded">has_role()</code> 
                          and check against <code className="text-xs bg-muted px-1 py-0.5 rounded">auth.uid()</code>.
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-2">Security Best Practices</h4>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                          <li>• All sensitive operations require authentication</li>
                          <li>• API keys and secrets stored in environment variables</li>
                          <li>• CORS properly configured for edge functions</li>
                          <li>• Input validation using Zod schemas</li>
                          <li>• SQL injection prevention via parameterized queries</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* AI Integration */}
            <Collapsible>
              <Card>
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Cpu className="h-5 w-5 text-primary" />
                        <CardTitle>AI Integration</CardTitle>
                      </div>
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardDescription>Lovable AI Gateway and intelligent features</CardDescription>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4 pt-0">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Lovable AI Gateway</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Provides seamless access to AI models without requiring API keys. Available models:
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                          <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">google/gemini-2.5-flash</code> - Default model, balanced performance</li>
                          <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">google/gemini-2.5-pro</code> - Advanced reasoning and multimodal</li>
                          <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">openai/gpt-5</code> - Powerful general-purpose model</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-2">AI-Powered Features</h4>
                        <ul className="text-sm text-muted-foreground space-y-2 ml-4">
                          <li>
                            <strong>Candidate Matching:</strong> Analyzes candidate profiles against job requirements 
                            and generates match scores with detailed justifications.
                          </li>
                          <li>
                            <strong>Interview Evaluation:</strong> Assesses candidate responses to interview questions, 
                            providing scores and feedback on each answer.
                          </li>
                          <li>
                            <strong>Video Analysis:</strong> Analyzes interview performance data to evaluate engagement, 
                            confidence, and communication skills.
                          </li>
                          <li>
                            <strong>Resume Parsing:</strong> Extracts structured data from resume PDFs including skills, 
                            experience, education, and contact information.
                          </li>
                          <li>
                            <strong>Job Description Generation:</strong> Creates comprehensive job descriptions from templates 
                            and basic requirements.
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-2">Implementation Pattern</h4>
                        <p className="text-sm text-muted-foreground">
                          All AI operations are performed in edge functions for security. The frontend calls edge functions 
                          which then communicate with the AI gateway. Results are stored in the database and cached for performance.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Data Flow */}
            <Collapsible>
              <Card>
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Network className="h-5 w-5 text-primary" />
                        <CardTitle>Data Flow & Communication</CardTitle>
                      </div>
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardDescription>How data moves through the system</CardDescription>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4 pt-0">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Request Flow</h4>
                        <ol className="text-sm text-muted-foreground space-y-1 ml-4 list-decimal">
                          <li>Frontend component triggers action (e.g., submit form)</li>
                          <li>TanStack Query mutation sends request to Supabase</li>
                          <li>Supabase validates JWT token and checks RLS policies</li>
                          <li>Database operation executes if authorized</li>
                          <li>Response returns to frontend with data or error</li>
                          <li>UI updates based on response</li>
                        </ol>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-2">Edge Function Flow</h4>
                        <ol className="text-sm text-muted-foreground space-y-1 ml-4 list-decimal">
                          <li>Frontend calls edge function using <code className="text-xs bg-muted px-1 py-0.5 rounded">supabase.functions.invoke()</code></li>
                          <li>Edge function receives request with authentication context</li>
                          <li>Function performs operations (AI calls, external APIs, etc.)</li>
                          <li>Function may read/write to database</li>
                          <li>Response returns to frontend with CORS headers</li>
                        </ol>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-2">Real-time Updates</h4>
                        <p className="text-sm text-muted-foreground">
                          Uses Supabase Realtime for live updates. Frontend subscribes to database changes 
                          (e.g., new candidates, status updates) and automatically refreshes UI without manual refresh.
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-2">Caching Strategy</h4>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                          <li>• TanStack Query caches API responses with configurable stale times</li>
                          <li>• Optimistic updates for better UX</li>
                          <li>• Automatic background refetching</li>
                          <li>• Cache invalidation on mutations</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Development & Deployment */}
            <Collapsible>
              <Card>
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        <CardTitle>Development & Deployment</CardTitle>
                      </div>
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardDescription>Build process, environment setup, and deployment</CardDescription>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4 pt-0">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Development Environment</h4>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                          <li>• <strong>Local Dev:</strong> <code className="text-xs bg-muted px-1 py-0.5 rounded">npm run dev</code> starts Vite dev server</li>
                          <li>• <strong>Environment Variables:</strong> Stored in <code className="text-xs bg-muted px-1 py-0.5 rounded">.env</code> file (auto-generated)</li>
                          <li>• <strong>Type Safety:</strong> TypeScript with strict mode enabled</li>
                          <li>• <strong>Linting:</strong> ESLint with React and TypeScript rules</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-2">Build Process</h4>
                        <ol className="text-sm text-muted-foreground space-y-1 ml-4 list-decimal">
                          <li>Vite bundles React app with tree-shaking</li>
                          <li>TypeScript compiles to optimized JavaScript</li>
                          <li>Tailwind CSS purges unused styles</li>
                          <li>Assets are fingerprinted for caching</li>
                          <li>Edge functions deploy automatically</li>
                        </ol>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-2">Deployment Strategy</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Frontend and backend deploy separately:
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                          <li>• <strong>Frontend:</strong> Static build deployed via Lovable hosting</li>
                          <li>• <strong>Backend:</strong> Edge functions auto-deploy on code changes</li>
                          <li>• <strong>Database:</strong> Migrations run automatically via Supabase</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-2">Performance Optimization</h4>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                          <li>• Code splitting with React.lazy and Suspense</li>
                          <li>• Image optimization and lazy loading</li>
                          <li>• Database indexes on frequently queried columns</li>
                          <li>• Edge function cold start optimization</li>
                          <li>• CDN caching for static assets</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Key Features */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle>Key System Features</CardTitle>
                </div>
                <CardDescription>Overview of main functionality</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Job Management</h4>
                    <p className="text-xs text-muted-foreground">
                      Create, edit, and publish job postings. Template system for recurring positions. 
                      Multi-location support with primary/secondary locations.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Candidate Pipeline</h4>
                    <p className="text-xs text-muted-foreground">
                      Drag-and-drop kanban board for managing candidates through recruitment stages. 
                      Automated stage transitions and notifications.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">AI Interviews</h4>
                    <p className="text-xs text-muted-foreground">
                      Automated video interviews with AI-generated questions. Intelligent evaluation 
                      of responses with scoring and feedback.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Smart Matching</h4>
                    <p className="text-xs text-muted-foreground">
                      AI-powered candidate-job matching based on skills, experience, and requirements. 
                      Detailed match analysis with justifications.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Resume Processing</h4>
                    <p className="text-xs text-muted-foreground">
                      Automated resume parsing with PDF text extraction. Batch upload support 
                      for processing multiple resumes simultaneously.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Analytics Dashboard</h4>
                    <p className="text-xs text-muted-foreground">
                      Real-time metrics and visualizations for recruitment performance. 
                      Department-wise job tracking and pipeline analytics.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Knowledge;
