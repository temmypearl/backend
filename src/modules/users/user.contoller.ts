import { authValidation } from "./user.validation"
import { User } from "./user.model"
import { Asyncly } from "../../extension"
import { Op } from "sequelize"
import { ApiError } from "../../middlewares"
const signin = Asyncly( async (req, res) => {
    const data = authValidation.registerSchema.parse(req.body)
    // const data = req.body
    try {
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [
                    { email: data.email },
                    
                    { phoneNumber: data.phoneNumber },
                ]
            }
            });
    
            if(existingUser) {
                throw new ApiError(409, 'User already exists')
            }
    
            const user = await User.create({
                email: data.email,
                password: data.password,
                firstName: data.firstName,
                lastName: data.lastName,
                phoneNumber: data.phoneNumber
            })
    
            res.status(201).json({
                message: 'User created successfully',
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phoneNumber: user.phoneNumber
                }
            })
    } catch (error) {
        console.error(error)
    }
    
})

const login = Asyncly( async (req, res) => {
    const data = authValidation.LoginSchema.parse(req.body)
    console.log(data)

    try {
        const existingUser = User.findOne({
            where:{
                [Op.or]: [
                    { email: data.email }
                ]
            }
        
        })
        ;
        if(!existingUser){
            throw new ApiError(409, 'wrong email or password')
        }
        
        const confirmPassword = await (await existingUser).comparePassword( data.password)

        console.log(confirmPassword)
         

        if (!confirmPassword){
            throw new ApiError(409, 'Wrong email or Password')
        }else{
            res.status(201).json({
                message: 'User created successfully',
                user: {
                    id: (await existingUser).id,
                    email: (await existingUser).email,
                    firstName: (await existingUser).firstName,
                    lastName: (await existingUser).lastName,
                    phoneNumber: (await existingUser).phoneNumber
                }
            })
        }
    } catch (error) {
        throw new ApiError(404, 'Something went Wrong, Please try afgain later')
    }

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

export const UserController = {
    signin,
    login,
    verifyAccount,
    refreshToken,
    logout
}
