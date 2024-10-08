"use client";
import React, { useState } from "react";
import Modal from "./Modal";

const Form: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    age: "",
    department: "",
    designation: "",
    placeOfWork: "",
    code: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [signature, setSignature] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImage(e.target.files[0]);
    }
  };

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSignature(e.target.files[0]);
    }
  };

  const sendOtp = async () => {
    const response = await fetch("/api/send-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: formData.email }),
    });

    if (response.ok) {
      setOtpSent(true);
      setModalMessage("OTP has been sent to your email.");
      setIsModalOpen(true);
    } else {
      setModalMessage("Error sending OTP.");
      setIsModalOpen(true);
    }
  };

  const verifyOtp = async () => {
    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email, code: formData.code }),
      });

      const result = await response.json();

      if (response.ok) {
        setOtpVerified(true);
        setStep(2);
        setModalMessage(
          "OTP verified successfully! Now you can fill the rest of the form"
        );
      } else {
        setModalMessage(`Invalid OTP. Please try again.`);
      }
    } catch (error: any) {
      setModalMessage(
        `Error verifying OTP: ${error.message || "Unknown error"}`
      );
    } finally {
      setIsModalOpen(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!otpVerified) {
      setModalMessage("Please verify your OTP before submitting.");
      setIsModalOpen(true);
      return;
    }

    const formDataWithFiles = new FormData();
    formDataWithFiles.append("name", formData.name);
    formDataWithFiles.append("email", formData.email);
    formDataWithFiles.append("phone", formData.phone);
    formDataWithFiles.append("address", formData.address);
    formDataWithFiles.append("age", formData.age);
    formDataWithFiles.append("department", formData.department);
    formDataWithFiles.append("designation", formData.designation);
    formDataWithFiles.append("placeOfWork", formData.placeOfWork);
    formDataWithFiles.append("code", formData.code);
    if (image) {
      formDataWithFiles.append("image", image);
    }
    if (signature) {
      formDataWithFiles.append("signature", signature);
    }

    const response = await fetch("/api/submit", {
      method: "POST",
      body: formDataWithFiles,
    });

    if (response.ok) {
      setModalMessage("Your data has been submitted successfully!");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "user_details.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();

      // Clear form data after successful submission
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        age: "",
        department: "",
        designation: "",
        placeOfWork: "",
        code: "",
      });
      setImage(null);
      setSignature(null);
      setOtpSent(false);
      setOtpVerified(false);
      setStep(1);
    } else {
      setModalMessage("Error submitting your data.");
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <div className="max-w-2xl w-full p-8 bg-gray-100 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && (
            <>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Step 1: Enter Your Details
              </h2>
              <div className="flex flex-col">
                <label htmlFor="name" className="text-gray-600">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="text-black border border-gray-300 rounded-lg p-2 mt-1"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="email" className="text-gray-600">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="text-black border border-gray-300 rounded-lg p-2 mt-1"
                />
              </div>
              <button
                type="button"
                onClick={sendOtp}
                disabled={otpSent}
                className={`mt-2 py-2 px-4 rounded-lg text-white ${
                  otpSent
                    ? "bg-gray-500"
                    : "bg-blue-500 hover:bg-blue-600"
                } transition`}
              >
                Send OTP
              </button>

              {otpSent && (
                <div className="flex flex-col mt-4">
                  <label htmlFor="code" className="text-gray-600">
                    Enter OTP
                  </label>
                  <input
                    id="code"
                    name="code"
                    placeholder="Enter OTP"
                    value={formData.code}
                    onChange={handleChange}
                    required
                    className="border border-gray-300 rounded-lg p-2 mt-1 text-black"
                  />
                  <button
                    type="button"
                    onClick={verifyOtp}
                    className="mt-2 py-2 px-4 rounded-lg bg-green-500 text-black hover:bg-green-600 transition"
                  >
                    Verify OTP
                  </button>
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Step 2: Fill Remaining Details
              </h2>

              <div className="flex flex-col">
                <label htmlFor="phone" className="text-gray-600">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="text-black border border-gray-300 rounded-lg p-2 mt-1"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="address" className="text-gray-600">
                  Address
                </label>
                <input
                  id="address"
                  name="address"
                  placeholder="Address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="text-black border border-gray-300 rounded-lg p-2 mt-1"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="age" className="text-gray-600">
                  Age
                </label>
                <input
                  id="age"
                  name="age"
                  placeholder="Age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  className="text-black border border-gray-300 rounded-lg p-2 mt-1"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="department" className="text-gray-600">
                  Department
                </label>
                <input
                  id="department"
                  name="department"
                  placeholder="Department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  className="text-black border border-gray-300 rounded-lg p-2 mt-1"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="designation" className="text-gray-600">
                  Designation
                </label>
                <input
                  id="designation"
                  name="designation"
                  placeholder="Designation"
                  value={formData.designation}
                  onChange={handleChange}
                  required
                  className="text-black border border-gray-300 rounded-lg p-2 mt-1"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="placeOfWork" className="text-gray-600">
                  Place of Work
                </label>
                <input
                  id="placeOfWork"
                  name="placeOfWork"
                  placeholder="Place of Work"
                  value={formData.placeOfWork}
                  onChange={handleChange}
                  required
                  className="text-black border border-gray-300 rounded-lg p-2 mt-1"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="image" className="text-black">
                  Upload Image
                </label>
                <input
                  id="image"
                  name="image"
                  type="file"
                  onChange={handleImageChange}
                  className="border border-gray-300 rounded-lg p-2 mt-1 text-black"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="signature" className="text-black">
                  Upload Signature
                </label>
                <input
                  id="signature"
                  name="signature"
                  type="file"
                  onChange={handleSignatureChange}
                  className="border border-gray-300 rounded-lg p-2 mt-1 text-black"
                />
              </div>

              <button
                type="submit"
                className="mt-4 py-2 px-4 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
              >
                Submit
              </button>
            </>
          )}
        </form>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal} message={modalMessage} />
    </div>
  );
};

export default Form;



// "use client"
// import React, { useState } from 'react';
// import Modal from './Modal';

// const Form: React.FC = () => {
//   const [step, setStep] = useState(1);
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     address: '',
//     age: '',
//     department: '',
//     designation: '',
//     placeOfWork: '',
//     code: '',
//   });
//   const [image, setImage] = useState<File | null>(null);
//   const [signature, setSignature] = useState<File | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [modalMessage, setModalMessage] = useState('');
//   const [otpSent, setOtpSent] = useState(false);
//   const [otpVerified, setOtpVerified] = useState(false);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       setImage(e.target.files[0]);
//     }
//   };


//   const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       setSignature(e.target.files[0]);
//     }
//   };

//   const sendOtp = async () => {
//     const response = await fetch('/api/send-otp', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ email: formData.email }),
//     });

//     if (response.ok) {
//       setOtpSent(true);
//       setModalMessage('OTP has been sent to your email.');
//       setIsModalOpen(true);
//     } else {
//       setModalMessage('Error sending OTP.');
//       setIsModalOpen(true);
//     }
//   };

//   const verifyOtp = async () => {
//     try {
//       const response = await fetch('/api/verify-otp', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email: formData.email, code: formData.code }), // Send 'code' instead of 'otp'
//       });
  
//       const result = await response.json();
  
//       if (response.ok) {
//         setOtpVerified(true);
//         setStep(2); // Move to the next step after successful OTP verification
//         setModalMessage('OTP verified successfully! Now you can fill the rest of the form');
//       } else {
//         setModalMessage(`Invalid OTP. Please try again.`);
//       }
//     } catch (error: any) {
//       setModalMessage(`Error verifying OTP: ${error.message || 'Unknown error'}`);
//     } finally {
//       setIsModalOpen(true);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     if (!otpVerified) {
//       setModalMessage('Please verify your OTP before submitting.');
//       setIsModalOpen(true);
//       return;
//     }

//     const formDataWithFiles = new FormData();
//     formDataWithFiles.append('name', formData.name);
//     formDataWithFiles.append('email', formData.email);
//     formDataWithFiles.append('phone', formData.phone);
//     formDataWithFiles.append('address', formData.address);
//     formDataWithFiles.append('age', formData.age);
//     formDataWithFiles.append('department', formData.department);
//     formDataWithFiles.append('designation', formData.designation);
//     formDataWithFiles.append('placeOfWork', formData.placeOfWork);
//     formDataWithFiles.append('code', formData.code);
//     if (image) {
//       formDataWithFiles.append('image', image);
//     }
//     if (signature) {
//       formDataWithFiles.append('signature', signature);
//     }
//     const response = await fetch('/api/submit', {
//       method: 'POST',
//       body: formDataWithFiles,
//     });

//     if (response.ok) {
//       setModalMessage('Your data has been submitted successfully!');
//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = 'user_details.pdf';
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//     } else {
//       setModalMessage('Error submitting your data.');
//     }

//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//   };

//   return (
//     <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-md">
//       <form onSubmit={handleSubmit} className="space-y-4">
//       {step === 1 && (
//   <>
//     <h2 className="text-xl font-semibold text-gray-700 mb-4">Step 1: Enter Your Details</h2>

//     <div className="flex flex-col">
//       <label htmlFor="name" className="text-gray-600">Name</label>
//       <input
//         id="name"
//         name="name"
//         placeholder="Name"
//         value={formData.name}
//         onChange={handleChange}
//         required
//         className="text-black border border-gray-300 rounded-lg p-2 mt-1"
//       />
//     </div>

//     <div className="flex flex-col">
//       <label htmlFor="email" className="text-gray-600">Email</label>
//       <input
//         id="email"
//         name="email"
//         placeholder="Email"
//         value={formData.email}
//         onChange={handleChange}
//         required
//         className="text-black border border-gray-300 rounded-lg p-2 mt-1"
//       />
//     </div>

//     <button
//       type="button"
//       onClick={sendOtp}
//       disabled={otpSent}
//       className={`mt-2 py-2 px-4 rounded-lg text-white ${otpSent ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-600'} transition`}
//     >
//       Send OTP
//     </button>

//     {otpSent && (
//       <div className="flex flex-col mt-4">
//         <label htmlFor="code" className="text-gray-600">Enter OTP</label>
//         <input
//           id="code"
//           name="code"
//           placeholder="Enter OTP"
//           value={formData.code}
//           onChange={handleChange}
//           required
//           className="border border-gray-300 rounded-lg p-2 mt-1 text-black"
//         />
//         <button
//           type="button"
//           onClick={verifyOtp}
//           className="mt-2 py-2 px-4 rounded-lg bg-green-500 text-black hover:bg-green-600 transition"
//         >
//           Verify OTP
//         </button>
//       </div>
//     )}
//   </>
// )}


//         {step === 2 && (
//           <>
//             <h2 className="text-xl font-semibold text-gray-700 mb-4">Step 2: Fill Remaining Details</h2>

//             <div className="flex flex-col">
//               <label htmlFor="phone" className="text-gray-600">Phone Number</label>
//               <input
//                 id="phone"
//                 name="phone"
//                 placeholder="Phone Number"
//                 value={formData.phone}
//                 onChange={handleChange}
//                 required
//                 className="text-black border border-gray-300 rounded-lg p-2 mt-1"
//               />
//             </div>

//             <div className="flex flex-col">
//               <label htmlFor="address" className="text-gray-600">Address</label>
//               <input
//                 id="address"
//                 name="address"
//                 placeholder="Address"
//                 value={formData.address}
//                 onChange={handleChange}
//                 required
//                 className="text-black border border-gray-300 rounded-lg p-2 mt-1"
//               />
//             </div>

//             <div className="flex flex-col">
//               <label htmlFor="age" className="text-gray-600">Age</label>
//               <input
//                 id="age"
//                 name="age"
//                 placeholder="Age"
//                 value={formData.age}
//                 onChange={handleChange}
//                 required
//                 className="text-black border border-gray-300 rounded-lg p-2 mt-1"
//               />
//             </div>

//             <div className="flex flex-col">
//               <label htmlFor="department" className="text-gray-600">Department</label>
//               <input
//                 id="department"
//                 name="department"
//                 placeholder="Department"
//                 value={formData.department}
//                 onChange={handleChange}
//                 required
//                 className="text-black border border-gray-300 rounded-lg p-2 mt-1"
//               />
//             </div>

//             <div className="flex flex-col">
//               <label htmlFor="designation" className="text-gray-600">Designation</label>
//               <input
//                 id="designation"
//                 name="designation"
//                 placeholder="Designation"
//                 value={formData.designation}
//                 onChange={handleChange}
//                 required
//                 className="text-black border border-gray-300 rounded-lg p-2 mt-1"
//               />
//             </div>

//             <div className="flex flex-col">
//               <label htmlFor="placeOfWork" className="text-gray-600">Place of Work</label>
//               <input
//                 id="placeOfWork"
//                 name="placeOfWork"
//                 placeholder="Place of Work"
//                 value={formData.placeOfWork}
//                 onChange={handleChange}
//                 required
//                 className="text-black border border-gray-300 rounded-lg p-2 mt-1"
//               />
//             </div>

//             <div className="flex flex-col">
//             <label htmlFor="image" className="text-gray-600">Upload Image</label>
//               <input
//                 id="image"
//                 type="file"
//                 name="image"
//                 onChange={handleImageChange}
//                 className="mt-1"
//               />
//             </div>


//             <div className="flex flex-col">
//               <label htmlFor="signature" className="text-gray-600">Upload Signature</label>
//               <input
//                 id="signature"
//                 type="file"
//                 accept="image/png, image/jpeg"
//                 onChange={handleSignatureChange}
//                 className="border border-gray-300 rounded-lg p-2 mt-1"
//               />
//             </div>

//             <button
//               type="submit"
//               className="mt-4 py-2 px-4 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
//             >
//               Submit
//             </button>
//           </>
//         )}
//       </form>

//       <Modal isOpen={isModalOpen} onClose={closeModal} message={modalMessage} />
//     </div>
//   );
// };

// export default Form;
