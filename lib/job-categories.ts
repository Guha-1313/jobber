// Job category definitions used across preferences, scoring, and recommendations.

export type JobCategory = {
  key: string
  label: string
  keywords: string[]        // job title substrings that indicate this category
  skills: string[]          // skills to learn for this path
  projects: string[]        // concrete project ideas
  certifications?: string[] // optional certs / courses worth mentioning
  platforms: { name: string; url: string }[] // where to find these jobs
}

export const JOB_CATEGORIES: JobCategory[] = [
  {
    key: 'Software Engineering',
    label: 'Software Engineering',
    keywords: [
      'software engineer', 'software developer', 'swe', 'programmer',
      'backend', 'frontend', 'full stack', 'fullstack', 'web developer',
      'web dev', 'mobile developer', 'ios developer', 'android developer',
      'systems engineer', 'platform engineer', 'application developer',
      'embedded engineer', 'engineer', 'developer',
    ],
    skills: ['Python', 'JavaScript / TypeScript', 'Data Structures & Algorithms', 'SQL', 'Git & GitHub', 'React or Next.js', 'REST APIs'],
    projects: [
      'Full-stack web app (any CRUD project shipped publicly)',
      'REST API with auth and a database',
      'Open source contribution (even a bug fix counts)',
      'CLI tool or automation script',
    ],
    certifications: ['LeetCode 75 (Easy + Medium)', 'AWS Cloud Practitioner'],
    platforms: [
      { name: 'Handshake', url: 'https://app.joinhandshake.com/jobs?query=Software+Engineer+Intern' },
      { name: 'LinkedIn', url: 'https://www.linkedin.com/jobs/search/?keywords=Software+Engineer+Intern' },
      { name: 'Levels.fyi', url: 'https://www.levels.fyi/jobs?jobType=intern' },
      { name: 'Simplify', url: 'https://simplify.jobs/jobs?search=software+engineer+intern' },
    ],
  },
  {
    key: 'Data Science / Machine Learning',
    label: 'Data Science / Machine Learning',
    keywords: [
      'data scientist', 'data analyst', 'machine learning', 'ml engineer',
      'ai engineer', 'data engineer', 'nlp engineer', 'research scientist',
      'quantitative analyst', 'quant', 'business intelligence', 'bi analyst',
      'analytics engineer', 'data',
    ],
    skills: ['Python', 'Pandas & NumPy', 'SQL', 'Machine Learning (scikit-learn)', 'Statistics & Probability', 'Data Visualization (Matplotlib / Seaborn)', 'Jupyter Notebooks'],
    projects: [
      'Kaggle competition submission with a write-up',
      'Exploratory data analysis (EDA) on a real dataset',
      'End-to-end ML model: training → evaluation → simple web API',
      'SQL analysis project with visualizations',
    ],
    certifications: ['Google Data Analytics Certificate', 'Kaggle micro-courses'],
    platforms: [
      { name: 'Handshake', url: 'https://app.joinhandshake.com/jobs?query=Data+Science+Intern' },
      { name: 'LinkedIn', url: 'https://www.linkedin.com/jobs/search/?keywords=Data+Science+Intern' },
      { name: 'Kaggle Jobs', url: 'https://www.kaggle.com/jobs' },
      { name: 'Simplify', url: 'https://simplify.jobs/jobs?search=data+science+intern' },
    ],
  },
  {
    key: 'Product Management',
    label: 'Product Management',
    keywords: [
      'product manager', 'product management', 'pm ', 'product owner',
      'program manager', 'associate pm', 'apm', 'product analyst',
      'product operations',
    ],
    skills: ['User Research & Interviews', 'Wireframing (Figma)', 'Product Metrics (AARRR)', 'SQL basics', 'Stakeholder communication', 'Writing specs / PRDs', 'A/B testing basics'],
    projects: [
      'Product teardown: deep dive + redesign of an existing app',
      'Mock product spec (PRD) for a new feature',
      'User research study with 5+ interviews',
      'Metrics dashboard for a side project',
    ],
    platforms: [
      { name: 'Handshake', url: 'https://app.joinhandshake.com/jobs?query=Product+Manager+Intern' },
      { name: 'LinkedIn', url: 'https://www.linkedin.com/jobs/search/?keywords=Product+Manager+Intern' },
      { name: 'Product School', url: 'https://productschool.com/jobs' },
    ],
  },
  {
    key: 'Design (UX/UI)',
    label: 'Design (UX/UI)',
    keywords: [
      'ux designer', 'ui designer', 'product designer', 'graphic designer',
      'visual designer', 'interaction designer', 'design intern', 'designer',
      'ux researcher', 'user experience', 'user interface',
    ],
    skills: ['Figma', 'User Research & Usability Testing', 'Information Architecture', 'Prototyping', 'Design Systems', 'Accessibility (WCAG)', 'Basic HTML/CSS'],
    projects: [
      'App redesign with before/after case study',
      'End-to-end UX case study (research → wireframes → prototype)',
      'Design system component library in Figma',
      'Usability study with 5+ participants and synthesis',
    ],
    platforms: [
      { name: 'Handshake', url: 'https://app.joinhandshake.com/jobs?query=UX+Design+Intern' },
      { name: 'LinkedIn', url: 'https://www.linkedin.com/jobs/search/?keywords=UX+Designer+Intern' },
      { name: 'Dribbble', url: 'https://dribbble.com/jobs?location=anywhere&employment_type=internship' },
    ],
  },
  {
    key: 'DevOps / Cloud',
    label: 'DevOps / Cloud',
    keywords: [
      'devops', 'site reliability', 'sre', 'cloud engineer', 'infrastructure',
      'platform engineer', 'devsecops', 'kubernetes', 'docker', 'ci/cd',
      'aws engineer', 'azure engineer', 'gcp engineer',
    ],
    skills: ['Linux / Shell scripting', 'Docker & Kubernetes', 'CI/CD (GitHub Actions)', 'AWS or GCP basics', 'Infrastructure as Code (Terraform)', 'Monitoring (Grafana, Prometheus)', 'Networking basics'],
    projects: [
      'Deploy a web app on AWS/GCP with CI/CD pipeline',
      'Dockerize an existing project with Docker Compose',
      'Set up Kubernetes cluster and deploy a service',
      'Write Terraform config for cloud infrastructure',
    ],
    certifications: ['AWS Cloud Practitioner', 'CKA (Certified Kubernetes Administrator)'],
    platforms: [
      { name: 'Handshake', url: 'https://app.joinhandshake.com/jobs?query=DevOps+Intern' },
      { name: 'LinkedIn', url: 'https://www.linkedin.com/jobs/search/?keywords=DevOps+Intern' },
    ],
  },
  {
    key: 'Cybersecurity',
    label: 'Cybersecurity',
    keywords: [
      'security engineer', 'cybersecurity', 'information security', 'infosec',
      'penetration tester', 'pen tester', 'security analyst', 'soc analyst',
      'threat analyst', 'security operations', 'application security', 'appsec',
    ],
    skills: ['Networking fundamentals (TCP/IP, DNS, HTTP)', 'Linux', 'Python scripting', 'CTF challenges', 'OWASP Top 10', 'Cryptography basics', 'SIEM tools'],
    projects: [
      'CTF write-ups (picoCTF, HackTheBox, TryHackMe)',
      'Home lab: network monitoring setup',
      'Vulnerability assessment of a test environment',
      'Security audit of your own web project',
    ],
    certifications: ['CompTIA Security+', 'Google Cybersecurity Certificate'],
    platforms: [
      { name: 'Handshake', url: 'https://app.joinhandshake.com/jobs?query=Cybersecurity+Intern' },
      { name: 'LinkedIn', url: 'https://www.linkedin.com/jobs/search/?keywords=Cybersecurity+Intern' },
      { name: 'CyberSeek', url: 'https://www.cyberseek.org/' },
    ],
  },
  {
    key: 'Business / Finance',
    label: 'Business / Finance',
    keywords: [
      'business analyst', 'financial analyst', 'investment banking', 'ib analyst',
      'finance intern', 'consulting', 'strategy', 'biz ops', 'operations analyst',
      'management consultant', 'associate analyst', 'corporate finance',
    ],
    skills: ['Excel & financial modeling', 'SQL basics', 'PowerPoint / Deck design', 'Data analysis', 'Financial statements reading', 'DCF & valuation basics', 'Written communication'],
    projects: [
      'DCF valuation model for a public company',
      'Market analysis report for an industry you follow',
      'Excel dashboard from a public dataset',
      'Case study: recommend a business strategy with data',
    ],
    certifications: ['Bloomberg Market Concepts (BMC)', 'CFA Level 1 (longer term)'],
    platforms: [
      { name: 'Handshake', url: 'https://app.joinhandshake.com/jobs?query=Finance+Intern' },
      { name: 'LinkedIn', url: 'https://www.linkedin.com/jobs/search/?keywords=Finance+Intern' },
      { name: 'Wall Street Oasis', url: 'https://www.wallstreetoasis.com/finance-jobs-board' },
    ],
  },
  {
    key: 'Marketing / Growth',
    label: 'Marketing / Growth',
    keywords: [
      'marketing', 'growth', 'digital marketing', 'content', 'seo', 'social media',
      'brand', 'marketing analyst', 'growth hacker', 'demand generation',
      'marketing manager', 'marketing intern', 'content marketing',
    ],
    skills: ['Google Analytics / GA4', 'SEO fundamentals', 'Content writing', 'Social media management', 'Email marketing (Mailchimp)', 'Paid ads (Meta / Google Ads basics)', 'Figma basics for creatives'],
    projects: [
      'Run a real marketing campaign for any project (even your own)',
      'SEO audit of a website with improvement recommendations',
      'A/B test two versions of a landing page',
      'Content calendar + 30 days of published posts',
    ],
    platforms: [
      { name: 'Handshake', url: 'https://app.joinhandshake.com/jobs?query=Marketing+Intern' },
      { name: 'LinkedIn', url: 'https://www.linkedin.com/jobs/search/?keywords=Marketing+Intern' },
    ],
  },
]

// Map from category key to the category object for fast lookup
export const CATEGORY_MAP = new Map(JOB_CATEGORIES.map(c => [c.key, c]))

// Returns all keywords for a given category key (used in scoring)
export function getCategoryKeywords(categoryKey: string): string[] {
  return CATEGORY_MAP.get(categoryKey)?.keywords ?? [categoryKey.toLowerCase()]
}
