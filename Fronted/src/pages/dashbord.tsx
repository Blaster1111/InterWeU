import Navbar from '../element/navbar'
import React, { useState ,useRef,useEffect} from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar, Briefcase, BookOpen, Building2, Upload, MapPin, Users, DollarSign,Check,FileText,X} from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CareerTrack {
  title: string;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
}

interface Company {
  name: string;
  openings: number;
  description: string;
  locations: string[];
  benefits: string[];
  salary: string;
  employeeCount: string;
  industry: string;
  founded: string;
}

interface ApplicationHistory {
  date: string;
  company: string;
  position: string;
  status: 'Applied' | 'Interview' | 'Pending';
}

const JobPortalDashboard = () => {
  const [username, setUsername] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const careerTracks: CareerTrack[] = [
    {
      title: "Resume Builder",
      description: "Create Professional Resumes",
      icon: <BookOpen className="w-6 h-6 text-white" />,
      bgColor: "bg-blue-600"
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
      bgColor: "bg-blue-400"
    }
  ];

  const trendingCompanies: Company[] = [
    { 
      name: "Google",
      openings: 150,
      description: "Join Google's innovative team and work on products that impact billions of users.",
      locations: ["Mountain View", "New York", "London"],
      benefits: ["Health Insurance", "401k", "Remote Work Options"],
      salary: "$130K - $250K",
      employeeCount: "150,000+",
      industry: "Technology",
      founded: "1998"
    },
    { 
      name: "Microsoft",
      openings: 120,
      description: "Build the future of technology at Microsoft, working on cutting-edge projects.",
      locations: ["Redmond", "Seattle", "Dublin"],
      benefits: ["Flexible Hours", "Stock Options", "Learning Allowance"],
      salary: "$125K - $240K",
      employeeCount: "180,000+",
      industry: "Technology",
      founded: "1975"
    },
    { 
      name: "Amazon",
      openings: 200,
      description: "Be part of Amazon's mission to be Earth's most customer-centric company.",
      locations: ["Seattle", "Austin", "Toronto"],
      benefits: ["Sign-on Bonus", "Relocation Support", "Parental Leave"],
      salary: "$120K - $230K",
      employeeCount: "1,600,000+",
      industry: "E-commerce/Technology",
      founded: "1994"
    },
    { 
      name: "Apple",
      openings: 85,
      description: "Create products that revolutionize the way people live and work.",
      locations: ["Cupertino", "Austin", "Singapore"],
      benefits: ["Health & Wellness", "Education Reimbursement", "Employee Discounts"],
      salary: "$140K - $260K",
      employeeCount: "160,000+",
      industry: "Technology/Consumer Electronics",
      founded: "1976"
    }
  ];

  const applicationHistory: ApplicationHistory[] = [
    { date: "Oct 25", company: "Google", position: "Software Engineer", status: "Applied" },
    { date: "Oct 27", company: "Microsoft", position: "Product Manager", status: "Interview" },
    { date: "Oct 28", company: "Amazon", position: "Data Scientist", status: "Pending" }
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setUploadError('');
    console.log(file);
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
  const handleUpload = async () => {
    if (!selectedFile) return;

    // Simulated upload logic
    try {
      // In a real application, you would:
      // 1. Create a FormData object
      const formData = new FormData();
      formData.append('resume', selectedFile);
      formData.append('company', selectedCompany?.name || '');

      // 2. Make an API call to your backend
      // const response = await fetch('/api/upload-resume', {
      //   method: 'POST',
      //   body: formData
      // });

      // 3. Handle the response
      setUploadSuccess(true);
    } catch (error) {
      setUploadError('Failed to upload resume. Please try again.');
    }
  };
  // ... (previous JSX remains the same until the upload section)
  const handleCompanyClick = (company: Company) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
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

    fetchUsername();
  }, []);





 

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
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800 font-mono">
                Recent Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {applicationHistory.map((app, index) => (
                  <div key={index} className="py-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800 font-mono">{app.company}</p>
                      <p className="text-sm text-gray-600 font-light">{app.position}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 font-light">{app.date}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-light
                        ${app.status === 'Applied' ? 'bg-blue-100 text-blue-800' :
                        app.status === 'Interview' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'}`}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Trending Companies - Expanded width */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800 font-mono">
                Trending Companies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {trendingCompanies.map((company, index) => (
                  <div 
                    key={index} 
                    className="p-4 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border border-gray-100"
                    onClick={() => handleCompanyClick(company)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <Building2 className="w-6 h-6 text-blue-600 mr-2" />
                        <div>
                          <h3 className="font-semibold text-gray-800 font-mono">{company.name}</h3>
                          <p className="text-sm text-gray-600 font-light">{company.industry}</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        {company.openings} jobs
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm font-light">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        {company.locations[0]}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-1" />
                        {company.employeeCount}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {company.salary}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        Founded {company.founded}
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
<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
<DialogContent className="sm:max-w-[600px]">

         <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-mono">
              <Building2 className="w-6 h-6 text-blue-600" />
              {selectedCompany?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4 space-y-6 font-light">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">About</h4>
              <p className="text-gray-600">{selectedCompany?.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Company Info</h4>
                <div className="space-y-2">
                  <p className="text-gray-600">Industry: {selectedCompany?.industry}</p>
                  <p className="text-gray-600">Founded: {selectedCompany?.founded}</p>
                  <p className="text-gray-600">Size: {selectedCompany?.employeeCount}</p>
                  <p className="text-gray-600">Salary Range: {selectedCompany?.salary}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Locations</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCompany?.locations.map((location, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                      {location}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2">Benefits</h4>
              <div className="grid grid-cols-2 gap-2">
                {selectedCompany?.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center text-gray-600 text-sm">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                    {benefit}
                  </div>
                ))}
              </div>
            </div>

            

            {/* <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Apply Now
              </button>
            </div> */}
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

    {/* Upload Button */}
    <div className="flex justify-end gap-3 mt-6">
      <button
        onClick={() => setIsModalOpen(false)}
        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={handleUpload}
        disabled={!selectedFile || uploadSuccess}
        className={`px-4 py-2 rounded-md transition-colors
          ${!selectedFile || uploadSuccess
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
      >
        {uploadSuccess ? 'Uploaded' : 'Upload Resume'}
      </button>
    </div>
  
</DialogContent>
</Dialog>

    </div>
  );
};

export default JobPortalDashboard;