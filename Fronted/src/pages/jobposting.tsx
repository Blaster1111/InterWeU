  import React, { useEffect, useState } from 'react';
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
  import axios from 'axios';
  interface JobPosting {
    _id: string;
    title: string;
    industry: string;
    department: string;
    location: string;
    benefits:string;
    type: string;
    salary: string;
    description: string;
    requirements: string;
    datePosted: string;
    status: 'active' | 'closed';
    applicants: number;
  }

  interface Applicant {
    _id:string;
    resumeSummary: string;
    strengths: string;
    atsScore: string;
    dateApplied: string;
    status:string;
    title:string
    username:string;
    email:string
  }

  interface ErrorState {
    applicants: string | null;
    jobPostings: string | null;
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
    const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);

    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);

    const [isLoading, setIsLoading] = useState({ applicants: false, jobPostings: false });
    const [error, setError] = useState<ErrorState>({
      applicants: null,
      jobPostings: null,
    });


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
   

    

    useEffect(() => {
      const fetchJobPostings = async () => {
        try {
          setIsLoading(prev => ({ ...prev, jobPostings: true })); // Set loading for job postings
          const employeeId = localStorage.getItem('employerId');
          if (!employeeId) {
            setError(prev => ({ ...prev, jobPostings: 'Employee ID not found' }));
            setIsLoading(prev => ({ ...prev, jobPostings: false }));
            return;
          }
      
          const response = await axios.get(`http://localhost:3000/api/job/posted/${employeeId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('employerToken')}`,
              'user': 'Employee'
            }
          });
      
          setJobPostings(response.data);
          setIsLoading(prev => ({ ...prev, jobPostings: false })); // Stop loading for job postings
        } catch (err) {
          setError(prev => ({ ...prev, jobPostings: 'Failed to fetch job postings' }));
          setIsLoading(prev => ({ ...prev, jobPostings: false }));
          console.error('Error fetching job postings:', err);
        }
      };
      fetchJobPostings();
    }, []);
    
    const fetchApplicantsForJob = async (jobId: string) => {
      try {
        setIsLoading(prev => ({ ...prev, applicants: true })); 
        setApplicants([]); // Clear previous applicants
        
        const response = await axios.get<{ data: any[] }>(`http://localhost:3000/api/job/${jobId}/applications`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('employerToken')}`,
            'user': 'Employee'
          }
        });
        
        // Transform the response to match our Applicant interface
        const transformedApplicants:any = response.data.data.map(applicant => ({
          _id: applicant._id,
          dateApplied: applicant.dateApplied,
          atsScore: applicant.atsScore,
          strengths: applicant.strengths,
          resumeSummary: applicant.resumeSummary,
          status: applicant.status,
          jobTitle: applicant.jobId.title,
          username: applicant.applicantId.username,
          email: applicant.applicantId.email
        }));
  
        setApplicants(transformedApplicants);
        setActiveTab('applicants');
       
        setIsLoading(prev => ({ ...prev, applicants: false })); 
      } catch (err) {
        setError(prev => ({ ...prev, applicants: 'Failed to fetch applicants for this job' }));
        setIsLoading(prev => ({ ...prev, applicants: false })); 
        console.error('Error fetching applicants:', err);
      }
    };
    

    const handleJobPostingClick = (job: JobPosting) => {
      setSelectedJob(job);
      fetchApplicantsForJob(job._id);
    };



    const handleNewJobSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        // Replace with actual form data and API endpoint
        const response = await axios.post('/api/job-postings', {
          // Form data would go here
        });
        
        // Add the new job posting to the list
        setJobPostings([...jobPostings, response.data]);
        setIsNewJobModalOpen(false);
      } catch (err) {
        console.error('Error creating job posting:', err);
        // Optionally set an error state to show to the user
      }
    };

    const handleApplicantStatusChange = async (applicantId: string, newStatus: Applicant['status']) => {
      try {
        // Replace with actual API endpoint for updating applicant status
        await axios.patch(`/api/applicants/${applicantId}`, { status: newStatus });
        
        // Optionally update local state or refetch applicants
        console.log(`Updated applicant ${applicantId} status to ${newStatus}`);
      } catch (err) {
        console.error('Error updating applicant status:', err);
      }
    };
    
    

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Navbar username={username}></Navbar>
        <Tabs defaultValue="postings" value={activeTab} onValueChange={setActiveTab} className="max-w-7xl mx-auto">
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
              {
              jobPostings.map((job) => (
                <Card key={job._id}
                onClick={() => handleJobPostingClick(job)}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">{job.title}</h3>
                        <div className="flex gap-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {job.industry}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {job.applicants} applicants
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Posted {job.datePosted.slice(0, 9)}
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
            <option value="Applied">Applied</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Rejected">Rejected</option>
          </select>
          </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="divide-y">
        {applicants
          .filter(applicant => 
            (filterStatus === 'all' || applicant.status === filterStatus) &&
            (searchTerm === '' || 
             applicant.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
             applicant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
             applicant.title.toLowerCase().includes(searchTerm.toLowerCase())
            )
          )
          .map((applicant) => (
            <div
              key={applicant._id}
              className="py-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
              onClick={() => {
                setSelectedApplicant(applicant);
                setIsApplicantModalOpen(true);
              }}
            >
              <div>
                <h4 className="font-medium text-gray-800">{applicant.username}</h4>
                <p className="text-sm text-gray-600">{applicant.title}</p>
                <div className="flex gap-4 mt-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {applicant.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Applied {new Date(applicant.dateApplied).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm
                ${applicant.status === 'Applied' ? 'bg-blue-100 text-blue-800' :
                applicant.status === 'Reviewed' ? 'bg-yellow-100 text-yellow-800' :
                applicant.status === 'Shortlisted' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'}`}>
                {applicant.status}
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
        <Dialog open={isApplicantModalOpen} onOpenChange={setIsApplicantModalOpen}>
  <DialogContent className="max-w-lg p-4">
    <DialogHeader>
      <DialogTitle>Applicant Details</DialogTitle>
    </DialogHeader>
    <div className="max-h-96 overflow-y-auto space-y-4">
      <div>
        <p className="font-semibold">Name:</p>
        <p>{selectedApplicant?.username}</p>
      </div>
      <div>
        <p className="font-semibold">Email:</p>
        <p>{selectedApplicant?.email}</p>
      </div>
      <div>
        <p className="font-semibold">Date Applied:</p>
        <p>{new Date(selectedApplicant!.dateApplied).toLocaleDateString()}</p>
      </div>
      <div>
        <p className="font-semibold">ATS Score:</p>
        <p>{selectedApplicant?.atsScore}</p>
      </div>
      <div>
        <p className="font-semibold">Strengths:</p>
        <p>{selectedApplicant?.strengths}</p>
      </div>
      <div>
        <p className="font-semibold">Resume Summary:</p>
        <p>{selectedApplicant?.resumeSummary}</p>
      </div>
    </div>
    <div className="flex justify-end gap-4 mt-4">
      <button className="btn-primary" onClick={openScheduler}>Schedule Interview</button>
    </div>
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
