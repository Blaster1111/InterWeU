import Navbar from '../element/navbar'
import React, { useState ,useRef,useEffect} from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar, Briefcase, BookOpen, Building2, Upload, MapPin, Users, DollarSign,Check,FileText,X,ClipboardList} from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { title } from 'process';

interface CareerTrack {
  title: string;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
}

interface Company {
  id: string; // organizationId._id for unique identification
  title:string;
  benefits:string
  requirements:string;
  description: string; // From job.description
  locations: string[]; // Derived from job.location
  industry: string; // organizationId.organizationType
  salary: string; // From job.salary
  organization: {
    id: string; // organizationId._id
    name: string; // organizationId.name
    email: string; // organizationId.email
    phoneNo: string; // organizationId.phoneNo
    type: string; // organizationId.organizationType
  };
}

interface JobDetails {
  title?: string;
  salary?: number;
  organizationName?: string;
}

interface ApplicationHistory {
  _id: string; // Use string since the _id in the response is a string
  dateApplied: string;
  job?: JobDetails; // Make job optional
  status: 'Applied' | 'Interview' | 'Pending' | 'Under Review';
}

interface DetailedApplicationInfo extends ApplicationHistory {
  companyName?: string;
  jobTitle?: string;
  jobDescription?: string;
  applicationMethod?: string;
  appliedDate?: string;
}

const JobPortalDashboard = () => {
  const [username, setUsername] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [coverLetter, setCoverLetter] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [trendingCompanies, setTrendingCompanies] = useState<Company[]>([]);
  const [applicationHistory, setApplicationHistory] = useState<ApplicationHistory[]>([]);

  const [selectedApplicationDetails, setSelectedApplicationDetails] = useState<DetailedApplicationInfo | null>(null);
  const [isApplicationDetailsModalOpen, setIsApplicationDetailsModalOpen] = useState(false);

  const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const careerTracks: CareerTrack[] = [
    {
      title: "Resume Builder",
      description: "Create Professional Resumes",
      icon: <BookOpen className="w-6 h-6 text-white" />,
      bgColor: "bg-blue-500"
    },
    {
      title: "Interview Prep",
      description: "Practice Common Questions",
      icon: <Briefcase className="w-6 h-6 text-white" />,
      bgColor: "bg-blue-500"
    },
    {
      title: "Application Tracker",
      description: "Track Your Applications",
      icon: <Calendar className="w-6 h-6 text-white" />,
      bgColor: "bg-blue-500"
    }
  ];
  const fetchTrendingCompanies = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/job/get`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          user: "Student",
        },
      });
  
      const jobs = response.data.data;
  
      // Map jobs to a list of Company objects, always creating a new one
      const companies: Company[] = jobs.map((job: any) => ({
        id: job._id,
        title:job.title,
        benefits:job.benefits,
        requirements:job.requirements,
        description: job.description,
        locations: job.location.split(" "), // Assuming location is a space-separated string
        industry: job.organizationId.organizationType || "Unknown",
        salary: `$${job.salary}/year`,
        organization: {
          id: job.organizationId._id,
          name: job.organizationId.name,
          email: job.organizationId.email,
          phoneNo: job.organizationId.phoneNo,
          type: job.organizationId.organizationType || "Unknown",
        },
      }));
  
      console.log(companies)
      setTrendingCompanies(companies); // Assuming setTrendingCompanies is a state setter function
      
    } catch (error) {
      console.error("Error fetching trending companies:", error);
      // Optionally set a default or error state
    }
  };
  // Fetch application history
  const fetchApplicationHistory = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/job/apply`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          user: "Student"
        }
      });
  
      // Map the response to ensure it matches the expected interface
      const formattedData: ApplicationHistory[] = response.data.data.map((application: any) => ({
        _id: application._id,
        dateApplied: application.dateApplied,
        job: application.job || {}, // Ensure job is defined even if empty
        status: application.status
      }));
  
      setApplicationHistory(formattedData);
      
    } catch (error) {
      console.error("Error fetching application history:",error);
  }
  };

  const handleApplicationClick = (application: ApplicationHistory) => {
    // Transform the application data into a more detailed format
    const detailedApplication: DetailedApplicationInfo = {
      ...application,
      companyName: application.job?.organizationName || 'Unknown Company',
      jobTitle: application.job?.title || 'Untitled Job',
      appliedDate: new Date(application.dateApplied).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      applicationMethod: 'Online Application', // You might want to fetch this from backend
      jobDescription: 'Job description details would typically come from the backend' // Placeholder
    };

    setSelectedApplicationDetails(detailedApplication);
    setIsApplicationDetailsModalOpen(true);
  };

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/students", {
          
          headers: {
            Authorization: "Bearer "+ localStorage.getItem("authToken"),
            user: "Student"
          },
        });
        setUsername(response.data.data.username);
        
      } catch (error) {
        console.error("Error fetching username:", error);
      }
    };

    // Fetch all necessary data
    fetchUsername();
    fetchTrendingCompanies();
    fetchApplicationHistory();
  }, []);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setUploadError('');
    
    setUploadSuccess(false);

    if (file) {
      // Check file type
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        setUploadError('Please upload a PDF or DOC/DOCX file');
        return;
      }

      // Check file size (5MB = 5 * 1024 * 1024 bytes)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      setUploadSuccess(true);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files?.[0];
    if (file) {
      // Simulate file input change
      const input = fileInputRef.current;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        
        // Trigger the file change handler
        const changeEvent = new Event('change', { bubbles: true });
        input.dispatchEvent(changeEvent);
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
const [isResumeUploaded, setIsResumeUploaded] = useState(false);
const [isCoverLetterUploaded, setIsCoverLetterUploaded] = useState(false);

const handleUpload = async () => {
  // Disable interactions during upload
  setIsUploading(true);

  // Validate inputs
  if (!selectedFile || !selectedCompany) {
    setUploadError('Please select a resume and a company');
    setIsUploading(false);
    return;
  }

  try {
    const formData = new FormData();
    
    if (selectedFile) {
      formData.append('Resume', selectedFile, selectedFile.name);
    }
    
    const trimmedCoverLetter = coverLetter.trim();
    if (trimmedCoverLetter) {
      formData.append('coverLetter', trimmedCoverLetter);
    }
    
    if (selectedCompany && selectedCompany.id) {
      formData.append('jobId', selectedCompany.id);
    }

    const response = await axios.post(`http://localhost:3000/api/job/apply`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        user: "Student",
      }
    });
    
    // Handle response
    if (response.data.success) {
      // Open success popup
      setIsSuccessPopupOpen(true);
      
      // Reset all states in the dialog
      resetDialogStates();
      
      fetchApplicationHistory();
      
      // Close the main modal after a short delay
      setTimeout(() => {
        setIsModalOpen(false);
        setIsSuccessPopupOpen(false);
      }, 2000);
    } else {
      setUploadError('Upload failed. Please try again.');
      setUploadSuccess(false);
    }
  } catch (error: any) {
    console.error('Upload failed:', error);
    
    setUploadSuccess(false);

    if (!error.response) {
      setUploadError('There is an issue with the server URL or network. Please check and try again.');
    } else if (error.response) {
      console.log('Error response:', error.response.data);
      setUploadError(error.response.data.message || 'Failed to upload resume. Please try again.');
    } else {
      setUploadError('Failed to upload resume. Please try again.');
    }
  } finally {
    // Re-enable interactions
    setIsUploading(false);
  }
};

// Create a function to reset dialog states
const resetDialogStates = () => {
  setSelectedFile(null);
  setCoverLetter('');
  setIsResumeUploaded(false);
  setIsCoverLetterUploaded(false);
  setUploadError('');
  setUploadSuccess(false);
  setSelectedCompany(null);
};


const handleCloseModal = () => {
  // Reset all states to their initial values
  setIsModalOpen(false);
  setSelectedFile(null);
  setCoverLetter('');
  setIsResumeUploaded(false);
  setIsCoverLetterUploaded(false);
  setUploadError('');
  setUploadSuccess(false);
  setSelectedCompany(null);
};

  // ... (previous JSX remains the same until the upload section)
  const handleCompanyClick = (company: Company) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

 





 

  return (
    
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar username={username}></Navbar>
      <div className={`max-w-7xl mx-auto p-6 ${isModalOpen ? 'blur-sm' : ''}`}>
        {/* Career Track Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {careerTracks.map((track, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className={`${track.bgColor} p-6 text-white`}>
                <div className="flex items-center justify-between">
                  {track.icon}
                  <button className="bg-white text-blue-600 px-4 py-2 rounded-md text-sm font-medium">
                    Start Now
                  </button>
                </div>
                <h3 className="text-xl font-bold mt-4 font-mono">{track.title}</h3>
                <p className="text-blue-100 mt-2 font-light">{track.description}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Recent Applications - Reduced width */}
          <Card className="md:col-span-1 w-full max-w-lg mx-auto border border-blue-500 rounded-lg shadow-lg shadow-blue-300">
  <CardHeader className="bg-blue-100 p-4 rounded-t-lg">
    <CardTitle className="text-xl font-semibold text-blue-800 font-mono">
      Recent Applications
    </CardTitle>
  </CardHeader>
  <CardContent className="p-4">
  <div className="divide-y max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-100">
    {applicationHistory.length > 0 ? (
      applicationHistory.map((app, index) => {
        // Format the date
        const formattedDate = new Date(app.dateApplied).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        return (
          <div
            key={index}
            onClick={() => handleApplicationClick(app)}
            className="py-4 flex justify-between items-center hover:bg-blue-50 rounded-lg transition-colors"
          >
            <div>
              <p className="font-medium text-blue-800">{app.job?.title || "No Title"}</p>
              <p className="text-sm text-gray-500">{formattedDate || "No Date"}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">{app.job?.organizationName || "No Organization"}</p>
              <span
                className={`inline-block px-2 py-1 rounded-full text-xs font-light
                  ${
                    app.status === "Applied"
                      ? "bg-blue-100 text-blue-800"
                      : app.status === "Interview"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
              >
                {app.status}
              </span>
            </div>
          </div>
        );
      })
    ) : (
      <p className="text-gray-600">No recent applications found.</p>
    )}
  </div>
</CardContent>

  
</Card>

<Dialog 
        open={isApplicationDetailsModalOpen} 
        onOpenChange={setIsApplicationDetailsModalOpen}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-mono">
              <ClipboardList className="w-6 h-6 text-blue-600" />
              Application Details
            </DialogTitle>
          </DialogHeader>

          {selectedApplicationDetails && (
            <div className="mt-4 space-y-6 font-light overflow-y-auto">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-800 mb-2">
                  {selectedApplicationDetails.jobTitle}
                </h3>
                <p className="text-gray-600">
                  <span className="font-medium">Company:</span> {selectedApplicationDetails.companyName}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Application Status</h4>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-light
                      ${
                        selectedApplicationDetails.status === "Applied"
                          ? "bg-blue-100 text-blue-800"
                          : selectedApplicationDetails.status === "Interview"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                  >
                    {selectedApplicationDetails.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Applied Date</h4>
                  <p className="text-gray-600">
                    {selectedApplicationDetails.appliedDate}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Application Method</h4>
                <p className="text-gray-600">
                  {selectedApplicationDetails.applicationMethod}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Job Description</h4>
                <p className="text-gray-600">
                  {selectedApplicationDetails.jobDescription || 'No description available'}
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button
              onClick={() => setIsApplicationDetailsModalOpen(false)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>




          {/* Trending Companies - Expanded width */}
          <Card className="md:col-span-2 w-full max-w-4xl mx-auto border border-blue-500 rounded-lg shadow-lg shadow-blue-300">
  <CardHeader className="bg-blue-100 p-4 rounded-t-lg">
    <CardTitle className="text-xl font-semibold text-blue-800 font-mono">
      Hiring Companies
    </CardTitle>
  </CardHeader>
  <CardContent className="p-4">
    <div className="space-y-4 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-100">
      {trendingCompanies.map((company, index) => (
        <div
          key={index}
          className="p-4 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors border border-blue-200"
          onClick={() => handleCompanyClick(company)}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center">
              <Building2 className="w-6 h-6 text-blue-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-800 font-mono">{company.organization.name}</h3>
                <p className="text-sm text-gray-600 font-light">{company.industry}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2 text-sm font-light text-gray-700">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 text-blue-600 mr-2" />
              {company.locations[0] || "N/A"}
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 font-medium">Salary:</span>
              <span className="ml-1">{company.salary || "Not Disclosed"}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </CardContent>
</Card>

        </div>
      </div>

      {/* Company Details Modal */}
      {/* // Update the upload section in the modal:

// ... (previous JSX remains the same until the upload section in DialogContent) */}
<Dialog 
  open={isModalOpen} 
  onOpenChange={!isUploading ? setIsModalOpen : undefined}
>
  <DialogContent 
    className="sm:max-w-[600px] max-h-[80vh] flex flex-col"
    // Prevent closing the dialog during upload
    onPointerDownOutside={isUploading ? (e) => e.preventDefault() : undefined}
    onEscapeKeyDown={isUploading ? (e) => e.preventDefault() : undefined}
  >
  <DialogHeader>
    <DialogTitle className="flex items-center gap-2 font-mono">
      <Building2 className="w-6 h-6 text-blue-600" />
      {selectedCompany?.organization.name}
    </DialogTitle>
  </DialogHeader>
  
  <div className="mt-4 space-y-6 font-light overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        
        <div className="mt-4 space-y-6 font-light">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">About</h4>
            <p className="text-gray-600">{selectedCompany?.description}</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
  {/* Company Info */}
  <div>
    
    <div className="space-y-2">
      {/* Combine Industry and Founded */}
      <p className="text-gray-600">
    <span className="font-medium">Industry:</span> {selectedCompany?.industry}
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    <span className="font-medium">Founded:</span> {selectedCompany?.organization?.name}
    </p>
      <p className="text-gray-600">
        <span className="font-medium">Salary Range:</span> {selectedCompany?.salary}
      </p>
    </div>
  </div>

  {/* Locations */}
  <div>
    <h4 className="font-medium text-gray-700 mb-2">Locations</h4>
    <div className="flex flex-wrap gap-2">
      {selectedCompany?.locations?.map((location, index) => (
        <span
          key={index}
          className="px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-600"
        >
          {location}
        </span>
      ))}
    </div>
  </div>
</div>


          <div>
          <h4 className="font-medium text-gray-700 mb-2">Requirements</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center text-gray-600 text-sm">
                <p className="text-blue-500">{selectedCompany?.requirements}</p>
                
              </div>
            </div>
          </div>

          {/* Cover Letter Input */}
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Cover Letter</h4>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Write your cover letter here..."
              className="w-full min-h-[150px] p-3 border border-gray-300 rounded-md text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200"
            />
          </div>

          {/* Error Alert */}
          {uploadError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {uploadSuccess && (
            <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
              <Check className="w-4 h-4" />
              <AlertDescription>Resume uploaded successfully!</AlertDescription>
            </Alert>
          )}

          {isResumeUploaded && isCoverLetterUploaded && (
            <Alert className="mt-4 bg-green-50 text-green-800 border-green-200">
              <Check className="w-4 h-4" />
              <AlertDescription>
                You have already submitted your resume and cover letter for this application.
              </AlertDescription>
            </Alert>
          )}

          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center
              ${selectedFile ? 'border-blue-300 bg-blue-50' : 'border-gray-300'}
              transition-colors duration-200`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
            />

            {!selectedFile ? (
              <>
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  Drag and drop your resume here, or{" "}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    browse files
                  </button>
                </p>
                <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX (max 5MB)</p>
              </>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-700">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            )}
          </div>
      </div>
          {/* Upload Button */}
          <div className="flex justify-end gap-3 mt-6">
      <button
        onClick={handleCloseModal}
        disabled={isUploading}
        className={`px-4 py-2 rounded-md transition-colors 
          ${isUploading 
            ? 'text-gray-400 cursor-not-allowed' 
            : 'text-gray-700 hover:bg-gray-100'
          }`}
      >
        Cancel
      </button>

      <button
        onClick={handleUpload}
        disabled={!selectedFile || !coverLetter.trim() || isUploading}
        className={`px-4 py-2 rounded-md transition-colors
          ${
            !selectedFile || !coverLetter.trim() || isUploading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
      >
        {isUploading ? 'Uploading...' : 'Upload Resume'}
      </button>
    </div>
  </div>
  </DialogContent>
</Dialog>
    // Add this Dialog component just before the closing div of your main component
    <Dialog 
  open={isSuccessPopupOpen} 
  onOpenChange={setIsSuccessPopupOpen}
>
  <DialogContent className="sm:max-w-[400px] bg-white rounded-xl shadow-2xl">
    <div className="flex flex-col items-center justify-center text-center p-6">
      <Check className="w-16 h-16 text-green-500 mb-4 animate-bounce" />
      <h2 className="text-2xl font-bold text-green-800 mb-2">Application Submitted</h2>
      <p className="text-gray-600 mb-4">
        Your application has been successfully processed.
      </p>
      <div className="w-full bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-center">
        <span className="text-green-700 font-medium">
          {selectedCompany?.organization.name || 'Company'}
        </span>
      </div>
    </div>
  </DialogContent>
</Dialog>


    </div>
  );
};

export default JobPortalDashboard;