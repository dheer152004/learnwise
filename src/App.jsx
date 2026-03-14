import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';  // ← FIXED: was './index.css'

import Layout from './components/Layout';

const Home = lazy(() => import('./assets/pages/Home'));
const Courses = lazy(() => import('./assets/pages/courses/Courses'));

const Physics = lazy(() => import('./assets/pages/courses/school/Physics'));
const Chemistry = lazy(() => import('./assets/pages/courses/school/Chemistry'));
const Math = lazy(() => import('./assets/pages/courses/school/Math'));
const Bio = lazy(() => import('./assets/pages/courses/school/Bio'));

const SchoolPageWrapper = () => <Courses initialTab="school" />;
const CollegePageWrapper = () => <Courses initialTab="college" />;

const Features = lazy(() => import('./assets/pages/Features'));
const Pricing = lazy(() => import('./assets/pages/Pricing'));
const Security = lazy(() => import('./assets/pages/Security'));
const Download = lazy(() => import('./assets/pages/Download'));
const Resources = lazy(() => import('./assets/pages/Resources'));
const Blog = lazy(() => import('./assets/pages/Blog'));
const HelpCenter = lazy(() => import('./assets/pages/HelpCenter'));
const Documentation = lazy(() => import('./assets/pages/Documentation'));
const API = lazy(() => import('./assets/pages/API'));

const About = lazy(() => import('./assets/pages/About'));
const Careers = lazy(() => import('./assets/pages/Careers'));
const Press = lazy(() => import('./assets/pages/Press'));
const Contact = lazy(() => import('./assets/pages/Contact'));

const Privacy = lazy(() => import('./assets/pages/Privacy'));
const Terms = lazy(() => import('./assets/pages/Terms'));
const Cookies = lazy(() => import('./assets/pages/Cookies'));
const GDPR = lazy(() => import('./assets/pages/GDPR'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div style={{ padding: '5rem', textAlign: 'center' }}>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="courses" element={<Courses />} />
            <Route path="courses/school" element={<SchoolPageWrapper />} />
            <Route path="courses/college" element={<CollegePageWrapper />} />
            <Route path="courses/physics" element={<Physics />} />
            <Route path="courses/chemistry" element={<Chemistry />} />
            <Route path="courses/math" element={<Math />} />
            <Route path="courses/bio" element={<Bio />} />
            <Route path="features" element={<Features />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="security" element={<Security />} />
            <Route path="download" element={<Download />} />
            <Route path="resources" element={<Resources />} />
            <Route path="blog" element={<Blog />} />
            <Route path="helpcenter" element={<HelpCenter />} />
            <Route path="documentation" element={<Documentation />} />
            <Route path="api" element={<API />} />
            <Route path="about" element={<About />} />
            <Route path="careers" element={<Careers />} />
            <Route path="press" element={<Press />} />
            <Route path="contact" element={<Contact />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="terms" element={<Terms />} />
            <Route path="cookies" element={<Cookies />} />
            <Route path="gdpr" element={<GDPR />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;