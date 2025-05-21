import { authValidation } from "./user.validation"
import { User } from "./user.model"
import { Asyncly } from "../../extension"
import { Op } from "sequelize"
import { ApiError } from "./../../middlewares"
import userActivityManager from "./user.activities"


const signin = Asyncly( async (req, res) => {
    const data = authValidation.registerSchema.parse(req.body)
    // const data = req.body
    try {
        const userCreate = new userActivityManager(req, {
            lastName: data.lastName,
            firstName: data.firstName,
            email: data.email,
            phoneNumber: data.phoneNumber,
            password: data.password
        })
        const {userWithoutPassword, access_token} = await userCreate.createuser()

        console.log(userWithoutPassword)

            res.status(201).json({
                message: 'User created successfully',
                user: {
                    userWithoutPassword
                },
                accessToken: access_token
            })
    } catch (error) {
        console.error(error)
    }
    
})

const login = Asyncly( async (req, res) => {
    const data = authValidation.LoginSchema.parse(req.body)
    
    try {
        const existingUser = new userActivityManager(req,{
            lastName: "",
            firstName: "",
            email: data.email,
            phoneNumber: "",
            password: data.password
        })

        const user = existingUser.logUserIN()
    } catch (error) {
        
    }

    // try {
    //     const existingUser = User.find({
    //         where:{
    //             [Op.or]: [
    //                 { email: data.email }
    //             ]
    //         }
        
    //     })
    //     ;
    //     if(!existingUser){
    //         throw new ApiError(409, 'wrong email or password')
    //     }
        
    //     const confirmPassword = await (await existingUser).comparePassword( data.password)

    //     console.log(confirmPassword)
         

    //     if (!confirmPassword){
    //         throw new ApiError(409, 'Wrong email or Password')
    //     }else{
    //         res.status(201).json({
    //             message: 'User created successfully',
    //             user: {
    //                 id: (await existingUser).id,
    //                 email: (await existingUser).email,
    //                 firstName: (await existingUser).firstName,
    //                 lastName: (await existingUser).lastName,
    //                 phoneNumber: (await existingUser).phoneNumber
    //             }
    //         })
    //     }
    // } catch (error) {
    //     throw new ApiError(404, 'Something went Wrong, Please try afgain later')
    // }

})
const verifyAccount = async (req, res) => {
    return res.status(200).json({
        name: 'Verify Account'
    })
}
const refreshToken = async (req, res) => {
    return res.status(200).json({
        name: 'refresh Token'
    })
}
const logout = async (req, res) => {
    return res.status(200).json({
        name: 'Logout'
    })
}

const UserController = {
    signin,
    login,
    verifyAccount,
    refreshToken,
    logout
}
export default UserController