import User from "../users/users.model";

const featureGuide = async () =>{
    const result = await User.find({ role: 'GUIDE'})
        .select('name expertise _id profilePicture languages')
        .limit(4);
    return result
};

export const guideService = {
    featureGuide
};