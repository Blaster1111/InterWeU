import React, { useState } from 'react';
import Navbar from '../element/navbar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import VideoMeetingScheduler from '../element/VideoMeetingScheduler'
import { 
  Building2, Users, Calendar, Clock, 
  Plus, Edit, Trash2, Search, Filter,
  Mail, Phone, Download, ThumbsUp, ThumbsDown
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  postedDate: string;
  status: 'active' | 'closed';
  applicants: number;
}

interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  experience: string;
  appliedDate: string;
  status: 'new' | 'reviewed' | 'shortlisted' | 'rejected';
  resumeUrl: string;
  jobTitle: string;
}

const EmployerDashboard = () => {
  const [username, setUsername] = useState("Google");
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('postings');
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [isApplicantModalOpen, setIsApplicantModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const openScheduler = () => {
    setIsApplicantModalOpen(false); // Close the applicant modal first
    setIsInterviewModalOpen(true);  // Then open the scheduler
  };
  
  const closeScheduler = () => {
    setIsInterviewModalOpen(false);
    setIsApplicantModalOpen(true); // Reopen the applicant modal if needed
  };

  const openModal = () => {
    setIsInterviewModalOpen(true);
  };
  
  // Function to close the modal
  const closeModal = () => {
    setIsInterviewModalOpen(false);
  };
  // Sample data
  const jobPostings: JobPosting[] = [
    {
      id: '1',
      title: 'Senior Software Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      salary: '$120K - $180K',
      description: 'Looking for an experienced software engineer...',
      requirements: ['5+ years experience', 'React expertise', 'Node.js'],
      postedDate: '2024-10-15',
      status: 'active',
      applicants: 12
    },
    // Add more sample job postings...
  ];

  const applicants: Applicant[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '(555) 123-4567',
      experience: '5 years',
      appliedDate: '2024-10-20',
      status: 'new',
      resumeUrl: '/resumes/john-doe.pdf',
      jobTitle: 'Senior Software Engineer'
    },
    // Add more sample applicants...
  ];

  const handleNewJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle job posting submission
    setIsNewJobModalOpen(false);
  };

  const handleApplicantStatusChange = (applicantId: string, newStatus: Applicant['status']) => {
    // Update applicant status logic
    console.log(`Updated applicant ${applicantId} status to ${newStatus}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Navbar username={username}></Navbar>
      <Tabs defaultValue="postings" className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="postings">Job Postings</TabsTrigger>
            <TabsTrigger value="applicants">Applicants</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <button
            onClick={() => setIsNewJobModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Post New Job
          </button>
        </div>

        {/* Job Postings Tab */}
        <TabsContent value="postings">
          <div className="grid gap-4">
            {jobPostings.map((job) => (
              <Card key={job.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{job.title}</h3>
                      <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {job.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {job.applicants} applicants
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Posted {job.postedDate}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-full">
                        <Edit className="w-5 h-5 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-full">
                        <Trash2 className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Applicants Tab */}
        <TabsContent value="applicants">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search applicants..."
                      className="pl-10 pr-4 py-2 border rounded-md"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    className="px-4 py-2 border rounded-md"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="new">New</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {applicants.map((applicant) => (
                  <div
                    key={applicant.id}
                    className="py-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      setSelectedApplicant(applicant);
                      setIsApplicantModalOpen(true);
                    }}
                  >
                    <div>
                      <h4 className="font-medium text-gray-800">{applicant.name}</h4>
                      <p className="text-sm text-gray-600">{applicant.jobTitle}</p>
                      <div className="flex gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {applicant.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Applied {applicant.appliedDate}
                        </span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm
                      ${applicant.status === 'new' ? 'bg-blue-100 text-blue-800' :
                      applicant.status === 'reviewed' ? 'bg-yellow-100 text-yellow-800' :
                      applicant.status === 'shortlisted' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'}`}>
                      {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-gray-800">Total Applications</h3>
                <p className="text-3xl font-semibold mt-2">156</p>
                <p className="text-sm text-green-600 mt-1">↑ 12% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-gray-800">Active Jobs</h3>
                <p className="text-3xl font-semibold mt-2">8</p>
                <p className="text-sm text-gray-600 mt-1">Across 4 departments</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-gray-800">Time to Hire</h3>
                <p className="text-3xl font-semibold mt-2">18 days</p>
                <p className="text-sm text-red-600 mt-1">↓ 3 days from average</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* New Job Modal */}
      <Dialog open={isNewJobModalOpen} onOpenChange={setIsNewJobModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Post New Job</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleNewJobSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Job Title</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={4}
                required
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsNewJobModalOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Post Job
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Applicant Details Modal */}
      <Dialog open={isApplicantModalOpen && !isInterviewModalOpen} onOpenChange={setIsApplicantModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Applicant Details</DialogTitle>
          </DialogHeader>
          {selectedApplicant && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{selectedApplicant.name}</h3>
                  <p className="text-gray-600">{selectedApplicant.jobTitle}</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <ThumbsUp className="w-5 h-5 text-green-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <ThumbsDown className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {selectedApplicant.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {selectedApplicant.phone}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {selectedApplicant.experience} of experience
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Applied on {selectedApplicant.appliedDate}
                  </p>
                </div>
                <div className="space-y-2">
                  <a
                    href={selectedApplicant.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <Download className="w-4 h-4" />
                    Download Resume
                  </a>
                  <p>
                    Status:{" "}
                    <span
                      className={
                        `px-3 py-1 rounded-full text-sm ${
                          selectedApplicant.status === "new"
                            ? "bg-blue-100 text-blue-800"
                            : selectedApplicant.status === "reviewed"
                            ? "bg-yellow-100 text-yellow-800"
                            : selectedApplicant.status === "shortlisted"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`
                      }
                    >
                      {selectedApplicant.status.charAt(0).toUpperCase() +
                        selectedApplicant.status.slice(1)}
                    </span>
                  </p>
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  Ensure you have reviewed all qualifications before making a decision.
                </AlertDescription>
              </Alert>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => handleApplicantStatusChange(selectedApplicant.id, "shortlisted")}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Shortlist
                </button>
                <button
                  onClick={() => handleApplicantStatusChange(selectedApplicant.id, "rejected")}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Reject
                </button>
                <button
                    onClick={openModal}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Schedule Interview
                </button>   
                      
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Conditionally Render VideoMeetingScheduler */}
      {isInterviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white shadow-lg rounded-lg p-4">
            <VideoMeetingScheduler onClose={() => setIsInterviewModalOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerDashboard;
