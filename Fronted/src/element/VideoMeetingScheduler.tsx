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
  onClose: () => void;
}

const VideoMeetingScheduler: React.FC<VideoMeetingSchedulerProps> = ({ onClose }) => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

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
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 }, 
        audio: true 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setIsCallActive(true);
    } catch (err) {
      console.error("Error accessing media devices.", err);
      // Display a user-friendly error message
      setIsVideoModalOpen(false);
      setIsCallActive(false);
      setStream(null);
      onClose();
      alert("Sorry, we were unable to access your camera. Please check your camera permissions and try again.");
    }
  };
  const endCall = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setIsCallActive(false);
    setIsVideoModalOpen(false);
    onClose();
  };

  const toggleMute = () => {
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTracks = stream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = isVideoOff;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6">
        {!isVideoModalOpen ? (
          <Card className="border-0 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Calendar className="w-6 h-6 text-blue-600" />
                Schedule Interview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Date
                    </label>
                    <input
                      type="date"
                      className="w-full p-3 border rounded-md"
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
                      className="w-full p-3 border rounded-md"
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
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-medium text-lg mb-4">Meeting Information</h3>
                  <div className="space-y-3 text-sm text-gray-600">
                    <p className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Video Interview Session
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Duration: 45 minutes
                    </p>
                    <p className="flex items-center gap-2">
                      <Camera className="w-5 h-5" />
                      HD Video Quality
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-4 justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-3 border rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleScheduleMeeting}
                  disabled={!selectedDate || !selectedTime}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                    disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Schedule Interview
                </button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Video Interview</h2>
              {!isCallActive && (
                <button onClick={endCall} className="text-gray-500 hover:text-gray-700">
                  <PhoneOff className="w-6 h-6" />
                </button>
              )}
            </div>

            {!isCallActive ? (
              <div className="space-y-6">
                <Alert>
                  <AlertDescription>
                    Interview scheduled for {selectedDate} at {selectedTime}
                  </AlertDescription>
                </Alert>
                
                <button
                  onClick={startCall}
                  className="w-full bg-blue-600 text-white p-4 rounded-md hover:bg-blue-700 
                    transition-colors flex items-center justify-center gap-2 text-lg"
                >
                  <Video className="w-6 h-6" />
                  Join Interview
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-gray-900 w-full h-96 rounded-xl relative overflow-hidden">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    muted={isMuted} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-6 right-6 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      muted 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="flex justify-center gap-6">
                  <button
                    onClick={toggleMute}
                    className={`p-4 rounded-full ${
                      isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                    } hover:bg-gray-200 transition-colors`}
                  >
                    {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </button>

                  <button
                    onClick={endCall}
                    className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                  >
                    <PhoneOff className="w-6 h-6" />
                  </button>

                  <button
                    onClick={toggleVideo}
                    className={`p-4 rounded-full ${
                      isVideoOff ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                    } hover:bg-gray-200 transition-colors`}
                  >
                    {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoMeetingScheduler;