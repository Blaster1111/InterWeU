import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Navbar from '../element/navbar';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import VideoMeetingScheduler from '../element/VideoMeetingScheduler'
import { 
  Building2, Calendar, 
  Plus, Edit, Trash2, Search, 
  Mail} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  salary: number;
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
  const [username] = useState("Google");
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('postings');
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [isApplicantModalOpen, setIsApplicantModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [, setSelectedJob] = useState<JobPosting | null>(null);

  const [, setIsLoading] = useState({ applicants: false, jobPostings: false });
  const [, setError] = useState<ErrorState>({
    applicants: null,
    jobPostings: null,
  });

  const [jobPostingForm, setJobPostingForm] = useState({
    title: '',
    description: '',
    requirements: '',
    industry: '',
    salary: 0,
    location: '',
    jobType: '',
    benefits: ''
  });

  const handleJobPostingFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setJobPostingForm(prev => ({
      ...prev,
      [name]: name === 'salary' ? Number(value) : value  // Convert salary to number
    }));
  };

  const handleCreateJobPosting = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!jobPostingForm.title || !jobPostingForm.description) {
      alert('Please fill in all required fields');
      return;
    }
  
    const organizationId = localStorage.getItem('organizationId');
    const postedBy = localStorage.getItem('employerId');
  
    if (!organizationId || !postedBy) {
      alert('Organization ID or Employee ID is missing');
      return;
    }
  
    const jobData = {
      ...jobPostingForm,
      organizationId,
      postedBy,
      status: 'open',
      applicants: 0, // Initialize applicants to 0
      datePosted: new Date().toISOString() // Add current date
    };
  
    try {
      const response = await axios.post('http://localhost:3000/api/job/create', jobData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('employerToken')}`,
          'user': 'Employee'
        }
      });
  
      // Ensure the response data is added to the existing array
      if (response.data.success) {
        setJobPostings((prevPostings) => [...prevPostings, response.data.data]);
    }
      
      // Reset form and close modal
      setJobPostingForm({
        title: '',
        description: '',
        requirements: '',
        industry: '',
        salary: 0,
        location: '',
        jobType: '',
        benefits: ''
      });
      setIsNewJobModalOpen(false);
    } catch (error) {
      console.error('Error creating job posting:', error);
      
      // More detailed error handling
      if (axios.isAxiosError(error)) {
        alert(`Error: ${error.response?.data?.message || 'Failed to create job posting'}`);
      } else {
        alert('An unexpected error occurred');
      }
    }
  };

  const openScheduler = () => {
    setIsApplicantModalOpen(false); // Close the applicant modal first
    setIsInterviewModalOpen(true);  // Then open the scheduler
  };
  

  
  // Function to close the modal
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
              className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 m-2 hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Post New Job
            </button>
          </div>

        {/* Job Postings Tab */}
        

<TabsContent value="postings">
  <div className="grid gap-4">
    {jobPostings.map((job) => (
      <Card 
        key={job._id} 
        onClick={() => handleJobPostingClick(job)}
        className="hover:shadow-lg transition-shadow duration-200"
      >
 <CardContent className="p-6 bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow">
 <div className="flex items-start justify-between">
  {/* Title Section */}
  <h3 className="text-lg font-bold text-gray-800 flex-1 text-left m-0 p-0">
    {job.title}
  </h3>

  {/* Action Buttons */}
  <div className="flex gap-3">
    <button
      className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
      aria-label="Edit Job"
    >
      <Edit className="w-5 h-5" />
    </button>
    <button
      className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
      aria-label="Delete Job"
    >
      <Trash2 className="w-5 h-5" />
    </button>
  </div>
</div>



  {/* Industry and Date Section */}
  <div className="flex gap-4 mt-2 text-sm text-gray-600">
    <span className="flex items-center gap-1 min-w-[100px]">
      <Building2 className="w-4 h-4" />
      {job.industry}
    </span>

    <span className="flex items-center gap-1">
      <Calendar className="w-4 h-4" />
      {job.datePosted
        ? `${formatDistanceToNow(new Date(job.datePosted), { addSuffix: true })}`
        : 'Date not available'}
    </span>
  </div>
</CardContent>




      </Card>
    ))}
  </div>
</TabsContent>;


          {/* Applicants Tab */}
          <TabsContent value="applicants">
  <Card className="border border-gray-200 rounded-lg shadow-sm">
    <CardHeader className="bg-gray-50 p-4 rounded-t-lg">
      <div className="flex justify-between items-center">
        {/* Search and Filter Section */}
        <div className="flex gap-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search applicants..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring focus:ring-blue-100 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Dropdown */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-md text-sm bg-white focus:ring focus:ring-blue-100 focus:border-blue-500"
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

    <CardContent className="p-4">
      <div className="divide-y divide-gray-200">
        {applicants.length > 0 ? (
          applicants
            .filter(
              (applicant) =>
                (filterStatus === "all" || applicant.status === filterStatus) &&
                (searchTerm === "" ||
                  applicant.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  applicant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  applicant.title.toLowerCase().includes(searchTerm.toLowerCase()))
            )
            .map((applicant) => (
              <div
  key={applicant._id}
  className="py-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition-colors"
  onClick={() => {
    setSelectedApplicant(applicant);
    setIsApplicantModalOpen(true);
  }}
>
  {/* Applicant Info Section */}
  <div className="flex-1">
  <h4 className="font-semibold text-gray-800 text-left text-sm m-0 p-0 capitalize">
  {applicant.username}
</h4>
    <p className="text-sm text-gray-600">{applicant.title}</p>
    <div className="flex gap-4 mt-1 text-sm text-gray-500">
      <span className="flex items-center gap-1 min-w-[120px]">
        <Mail className="w-4 h-4 text-gray-400" />
        {applicant.email}
      </span>
      <span className="flex items-center gap-1">
        <Calendar className="w-4 h-4 text-gray-400" />
        Applied {new Date(applicant.dateApplied).toLocaleDateString()}
      </span>
    </div>
  </div>

  {/* Status Badge */}
  <span
    className={`px-3 py-1 rounded-full text-xs font-medium
    ${
      applicant.status === "Applied"
        ? "bg-blue-100 text-blue-800"
        : applicant.status === "Reviewed"
        ? "bg-yellow-100 text-yellow-800"
        : applicant.status === "Shortlisted"
        ? "bg-green-100 text-green-800"
        : "bg-red-100 text-red-800"
    }`}
  >
    {applicant.status}
  </span>
</div>

            ))
        ) : (
          <p className="text-gray-500 text-center py-6">No applicants found.</p>
        )}
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
    <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-gray-800">
          Create a New Job Posting
        </DialogTitle>
      </DialogHeader>
      <DialogDescription>
    Please fill out the form below to create a new job posting.
  </DialogDescription>
      
      <form onSubmit={handleCreateJobPosting} className="space-y-6 p-4">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title
            </label>
            <input
              name="title"
              type="text"
              value={jobPostingForm.title}
              onChange={handleJobPostingFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Senior Software Engineer"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Industry
            </label>
            <input
              name="industry"
              type="text"
              value={jobPostingForm.industry}
              onChange={handleJobPostingFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Technology"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Description
          </label>
          <textarea
            name="description"
            rows={4}
            value={jobPostingForm.description}
            onChange={handleJobPostingFormChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Provide a detailed description of the job role..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Requirements
          </label>
          <textarea
            name="requirements"
            rows={4}
            value={jobPostingForm.requirements}
            onChange={handleJobPostingFormChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="List the key requirements for the position..."
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              name="location"
              type="text"
              value={jobPostingForm.location}
              onChange={handleJobPostingFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. San Francisco, CA"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Type
            </label>
            <select
              name="jobType"
              value={jobPostingForm.jobType}
              onChange={handleJobPostingFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Job Type</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Remote">Remote</option>
            </select>
          </div>
        </div>

        <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Salary
  </label>
  <input
    name="salary"
    type="number"  
    value={jobPostingForm.salary}
    onChange={handleJobPostingFormChange}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="e.g. 100000"
    required
  />
</div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Benefits
            </label>
            <textarea
              name="benefits"
              rows={3}
              value={jobPostingForm.benefits}
              onChange={handleJobPostingFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="List key benefits and perks..."
              required
            />
          </div>
        

        <div className="flex justify-end space-x-4 mt-6">
          <button 
            type="button"
            onClick={() => setIsNewJobModalOpen(false)}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Post Job
          </button>
        </div>
      </form>
    </DialogContent>
  </Dialog>

        {/* Applicant Details Modal */}
  <Dialog open={isApplicantModalOpen} onOpenChange={setIsApplicantModalOpen}>
  <DialogContent className="max-w-lg p-6 bg-white rounded-lg shadow-lg">
    <DialogHeader>
      <DialogTitle className="text-xl font-semibold text-gray-800">Applicant Details</DialogTitle>
    </DialogHeader>
    <div className="max-h-96 overflow-y-auto space-y-6 mt-4">
      {/* Name */}
      <div>
        <p className="font-semibold text-gray-700">Name:</p>
        <p className="text-gray-600">{selectedApplicant?.username}</p>
      </div>

      {/* Email */}
      <div>
        <p className="font-semibold text-gray-700">Email:</p>
        <p className="text-gray-600">{selectedApplicant?.email}</p>
      </div>

      {/* Date Applied */}
      <div>
        <p className="font-semibold text-gray-700">Date Applied:</p>
        <p className="text-gray-600">
          {selectedApplicant?.dateApplied
            ? new Date(selectedApplicant.dateApplied).toLocaleDateString()
            : "N/A"}
        </p>
      </div>

      {/* ATS Score */}
      <div>
        <p className="font-semibold text-gray-700">ATS Score:</p>
        <p className="text-gray-600">{selectedApplicant?.atsScore}</p>
      </div>

      {/* Strengths */}
      <div>
        <p className="font-semibold text-gray-700">Strengths:</p>
        <p className="text-gray-600">{selectedApplicant?.strengths}</p>
      </div>

      {/* Resume Summary */}
      <div>
        <p className="font-semibold text-gray-700">Resume Summary:</p>
        <p className="text-gray-600">{selectedApplicant?.resumeSummary}</p>
      </div>
    </div>

    {/* Button Section */}
    <div className="flex justify-end gap-4 mt-6">
      <button
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        onClick={openScheduler}
      >
        Schedule Interview
      </button>
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