# Learnwise

## 📚 What is Learnwise?

**Learnwise** is an educational learning platform built with modern web technologies. It provides a comprehensive solution for students to access courses, resources, and educational content across multiple subjects. The platform offers interactive learning experiences with support for school-level courses including Mathematics, Physics, Chemistry, and Biology.

## 🎯 Purpose

Learnwise aims to:
- make quality education accessible to students
- Provide interactive and engaging learning experiences
- Offer diverse course content for different education levels
- Support students in STEM subjects with simulations and experiments

## 📁 Project Structure

```
learno/
├── src/
│   ├── App.jsx                 # Main application component
│   ├── App.css                 # Global styles
│   ├── index.css               # Base styles
│   ├── main.jsx                # Application entry point
│   │
│   ├── assets/pages/           # Page components
│   │   ├── Home.jsx            # Landing page
│   │   ├── About.jsx           # About page
│   │   ├── Features.jsx        # Platform features
│   │   ├── Pricing.jsx         # Pricing plans
│   │   ├── Documentation.jsx   # User documentation
│   │   ├── API.jsx             # API documentation
│   │   ├── Blog.jsx            # Blog section
│   │   ├── Resources.jsx       # Learning resources
│   │   ├── Contact.jsx         # Contact page
│   │   ├── HelpCenter.jsx      # Help & FAQs
│   │   ├── Download.jsx        # Download options
│   │   ├── Careers.jsx         # Career opportunities
│   │   ├── Press.jsx           # Press releases
│   │   ├── Security.jsx        # Security information
│   │   ├── Privacy.jsx         # Privacy policy
│   │   ├── Terms.jsx           # Terms of service
│   │   ├── GDPR.jsx            # GDPR compliance
│   │   ├── Cookies.jsx         # Cookie policy
│   │   │
│   │   └── courses/            # Course pages
│   │       ├── Courses.jsx     # Course listing
│   │       ├── School.jsx      # School courses
│   │       ├── Collage.jsx     # College courses
│   │       │
│   │       └── school/         # School subjects
│   │           ├── Math.jsx
│   │           ├── Physics.jsx
│   │           ├── Chemistry.jsx
│   │           ├── Bio.jsx
│   │           │
│   │           ├── Maths/              # Mathematics module
│   │           │   ├── maths.html
│   │           │   ├── maths-script.js
│   │           │   ├── maths-ai.js
│   │           │   └── maths-style.css
│   │           │
│   │           ├── Physics/            # Physics module
│   │           │   ├── index.html
│   │           │   ├── app.js
│   │           │   ├── experiments.js
│   │           │   ├── simulations.js
│   │           │   ├── grok.js
│   │           │   ├── grok_panel.js
│   │           │   └── style.css
│   │           │
│   │           └── Biology/            # Biology module
│   │               ├── bio_index.html
│   │               ├── bio_app.js
│   │               ├── bio_experiments.js
│   │               ├── bio_simulations.js
│   │               ├── grok.js
│   │               ├── grok_panel.js
│   │               └── style.css
│   │
│   └── components/             # Reusable components
│       ├── Navbar.jsx          # Navigation bar
│       ├── Footer.jsx          # Footer component
│       └── Layout.jsx          # Layout wrapper
│
├── public/                     # Static assets
├── index.html                  # HTML entry point
├── vite.config.js             # Vite configuration
├── eslint.config.js           # ESLint configuration
├── package.json               # Project dependencies
├── .env                       # Environment variables
└── README.md                  # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd learnwise
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with necessary environment variables (if needed)

### Running the Application

**Development mode:**
```bash
npm run dev
```
This starts the Vite development server. The app will be available at `http://localhost:5173`

**Build for production:**
```bash
npm run build
```
This creates an optimized production build in the `dist/` directory.

**Preview production build:**
```bash
npm run preview
```
Preview the production build locally before deployment.

**Lint code:**
```bash
npm run lint
```
Check code quality with ESLint.

## 📚 Key Features

### Pages & Sections
- **Home** - Landing page introducing Learnwise
- **Courses** - Browse available courses for school and college
- **Features** - Explore platform capabilities
- **Pricing** - View subscription/pricing plans
- **Resources** - Access learning materials and assets
- **Documentation** - API and user documentation
- **Blog** - Educational articles and updates
- **Support** - Help center and FAQs
- **Legal** - Privacy, Terms, GDPR, Cookies policies

### Course Modules
- **Mathematics** - Interactive math problems and AI-powered assistance
- **Physics** - Experiments, simulations, and interactive labs
- **Chemistry** - Chemical concepts and interactive tools
- **Biology** - Biology experiments and simulations

Each subject module includes:
- Interactive experiments
- Simulations for visualization
- Grok AI panel for intelligent assistance
- Module-specific styling and scripts

## 🛠 Technology Stack

- **Frontend Framework** - React 19.2
- **Build Tool** - Vite 7.3.1
- **Routing** - React Router DOM 7.13.1
- **Styling** - CSS (modular, subject-specific)
- **Linting** - ESLint 9.39.1
- **Development Server** - Vite dev server

## 📝 Environment Configuration

The `.env` file can contain environment-specific variables such as:
- API endpoints
- Feature flags
- Third-party service keys

## 🔄 Project Status

This is an active learning platform under development. The structure supports:
- Multiple subject areas
- School and college level courses
- Interactive learning modules
- Responsive web design

## 📞 Support

For issues, questions, or suggestions, please refer to:
- Help Center page
- Contact page
- Documentation section

## 📄 License

[Add your license information here if applicable]

---

**Last Updated:** March 2026
