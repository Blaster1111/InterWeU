import React, { useState, useRef, useEffect } from 'react';
import { Camera, Calendar, Clock, Users, Mic, Video, PhoneOff, MicOff, VideoOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VideoMeetingSchedulerProps {
    onClose: () => void; // Define the onClose prop
  }

const VideoMeetingScheduler: React.FC<VideoMeetingSchedulerProps> = ({ onClose }) => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  let stream: MediaStream | null = null;

  // Sample available time slots
  const availableTimeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM',
    '02:00 PM', '03:00 PM', '04:00 PM'
  ];

  const handleScheduleMeeting = () => {
    if (!selectedDate || !selectedTime) {
      return;
    }
    setIsVideoModalOpen(true);
  };

  const startCall = async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsCallActive(true);
    } catch (err) {
      console.error("Error accessing media devices.", err);
    }
  };

  const endCall = () => {
    setIsCallActive(false);
    setIsVideoModalOpen(false);
    // Stop all tracks when ending the call
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = isVideoOff;
      setIsVideoOff(!isVideoOff);
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Schedule Interview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Date
              </label>
              <input
                type="date"
                className="w-full p-2 border rounded-md"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Time
              </label>
              <select
                className="w-full p-2 border rounded-md"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              >
                <option value="">Choose a time slot</option>
                {availableTimeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleScheduleMeeting}
              disabled={!selectedDate || !selectedTime}
              className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 
                disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Schedule Video Interview
            </button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-600" />
              Video Interview
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {!isCallActive ? (
              <div className="space-y-4">
                <Alert>
                  <AlertDescription>
                    Interview scheduled for {selectedDate} at {selectedTime}
                  </AlertDescription>
                </Alert>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Meeting Details</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date: {selectedDate}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Time: {selectedTime}
                    </p>
                    <p className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Participants: You and the applicant
                    </p>
                  </div>
                </div>

                <button
                  onClick={startCall}
                  className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 
                    transition-colors flex items-center justify-center gap-2"
                >
                  <Video className="w-4 h-4" />
                  Join Meeting
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Video Preview */}
                <div className="bg-gray-900 w-full h-64 rounded-lg relative">
                  <video ref={videoRef} autoPlay muted={!isMuted} className="w-full h-full rounded-lg" />

                  {/* Small self-view */}
                  <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-800 rounded-lg 
                    flex items-center justify-center">
                    <Users className="w-6 h-6 text-gray-400" />
                  </div>
                </div>

                {/* Call Controls */}
                <div className="flex justify-center gap-4">
                  <button
                    onClick={toggleMute}
                    className={`p-3 rounded-full ${
                      isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                    } hover:bg-gray-200 transition-colors`}
                  >
                    {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </button>

                  <button
                    onClick={endCall}
                    className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                  >
                    <PhoneOff className="w-6 h-6" />
                  </button>

                  <button
                    onClick={toggleVideo}
                    className={`p-3 rounded-full ${
                      isVideoOff ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                    } hover:bg-gray-200 transition-colors`}
                  >
                    {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoMeetingScheduler;
