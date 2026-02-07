const SkeletonProfile = () => {
    return (
        <div className="container mx-auto px-4 py-8 animate-pulse">
            <div className="max-w-3xl mx-auto bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700">
                {/* Header Skeleton */}
                <div className="h-32 bg-gray-700"></div>

                <div className="px-8 pb-8">
                    {/* Profile Image Skeleton */}
                    <div className="relative -mt-16 mb-6 flex justify-between items-end">
                        <div className="w-32 h-32 rounded-full border-4 border-gray-800 bg-gray-600"></div>
                        <div className="w-32 h-10 bg-gray-600 rounded-lg"></div>
                    </div>

                    {/* Info Section Skeleton */}
                    <div className="space-y-4">
                        <div>
                            <div className="h-8 bg-gray-600 rounded w-1/2 mb-2"></div>
                            <div className="h-5 bg-gray-600 rounded w-1/4"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div className="bg-gray-700 bg-opacity-40 p-4 rounded-lg border border-gray-600 h-20"></div>
                            <div className="bg-gray-700 bg-opacity-40 p-4 rounded-lg border border-gray-600 h-20"></div>
                        </div>

                        <div className="bg-gray-700 bg-opacity-40 p-4 rounded-lg border border-gray-600 h-24"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SkeletonProfile;
