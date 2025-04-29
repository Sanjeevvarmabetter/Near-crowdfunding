import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';

const Create = ({ uploadToPinata, createFund }) => {
    const [file, setFile] = useState(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [deadline, setDeadline] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const { getRootProps, getInputProps } = useDropzone({
        accept: { 'image/*': [] },
        onDrop: (acceptedFiles) => {
            const uploadedFile = acceptedFiles[0];
            setFile(uploadedFile);
        },
    });

    const clearImage = () => {
        setFile(null);
    };

    const handleMint = async () => {
        if (!file || !name || !description || !targetAmount || !deadline) {
            alert('Please complete all fields');
            return;
        }

        

        setIsCreating(true);

        try {
            const currentTime = Math.floor(Date.now() / 1000);
            const unixTimestamp = Math.floor(new Date(deadline).getTime() / 1000);
            const deadlineNanoseconds = unixTimestamp * 1_000_000_000;

            if (unixTimestamp <= currentTime) {
                alert('Deadline must be in the future.');
                return;
            }

            const ImageIpfsHash = await uploadToPinata(file);

            createFund(ImageIpfsHash, name, description, targetAmount, deadlineNanoseconds);
            clearImage();
        } catch (e) {
            console.error(e);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen text-white pt-15">
            <div className="flex w-full max-w-4xl">
                <div className="flex flex-col items-center justify-center w-1/3 mr-6">
                    <div
                        {...getRootProps({ className: 'border-2  border-blue-500 rounded-lg p-6 text-center' })}>
                        <input {...getInputProps()} />
                        {file ? (
                            <img src={URL.createObjectURL(file)} alt="Preview" className="max-w-[200px] rounded-lg mb-4" />
                        ) : (
                            <a className="text-purple-500">Upload a JPEG/PNG</a>
                        )}
                    </div>
                    {file && (
                        <button
                            onClick={clearImage}
                            className="bg-red-500 text-white rounded-lg px-4 py-2 mb-4 mt-4">
                            Clear
                        </button>
                    )}
                </div>

                {/* Form Section */}
                <div className="flex item-center flex-col w-2/3">
                    <h2 className="text-3xl font-bold mb-6">Create Your Fund</h2>

                    <div className="w-full max-w-md mb-4">
                        <label className="block mb-2">Title:</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter Fund Title"
                            className="w-full p-2 rounded-lg border border-gray-300"
                        />
                    </div>

                    <div className="w-full max-w-md mb-4">
                        <label className="block mb-2">Description:</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter Fund Description"
                            className="w-full p-2 rounded-lg border border-gray-300"
                        />
                    </div>

                    <div className="w-full max-w-md mb-4">
                        <label className="block mb-2">Target Amount:</label>
                        <input
                            type="number"
                            value={targetAmount}
                            onChange={(e) => setTargetAmount(e.target.value)}
                            placeholder="Enter Target Amount"
                            className="w-full p-2 rounded-lg border border-gray-300"
                        />
                    </div>

                    <div className="w-full max-w-md mb-4">
                        <label className="block mb-2">Deadline:</label>
                        <input
                            type="datetime-local"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            min={new Date().toISOString().slice(0, 16)}
                            className="w-full p-2 rounded-lg border border-gray-300"
                        />
                    </div>

                    <div className='flex items-center w-3/4 justify-center'>
                        <button
                            onClick={handleMint}
                            disabled={isCreating}
                            className={`bg-blue-500 text-white rounded-lg px-4 py-2 ${isCreating ? 'cursor-not-allowed' : 'hover:bg-purple-600'}`}
                        >
                            {isCreating ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Create;
