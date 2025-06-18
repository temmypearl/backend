    import jwt from 'jsonwebtoken';
    import { config } from '../config';
    import { ITokenPayload } from '../modules/users/user.interface';

    export class TokenService {
    static generateAccessToken(payload: ITokenPayload): string {
        return jwt.sign({ payload }, config.JWT_ACCESS_SECRET, {
        expiresIn: `${config.ACCESS_TOKEN_EXPIRES_DAYS}h`,
        algorithm: 'HS256',
        });
    }

    static verifyAccessToken(token: string): ITokenPayload {
        const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET) as { payload: ITokenPayload };
        return decoded.payload;
    }

    static generateRefreshToken(payload: ITokenPayload): string {
        return jwt.sign({ payload }, config.JWT_REFRESH_SECRET, { expiresIn: `${config.REFRESH_TOKEN_EXPIRES_DAYS}d` });
    }

    static verifyRefreshToken(token: string): ITokenPayload {
        const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET) as { payload: ITokenPayload };
        return decoded.payload;
    }

    static decodeAccessToken(token: string): ITokenPayload | null {
        const decoded = jwt.decode(token) as { payload: ITokenPayload } | null;
        return decoded ? decoded.payload : null;
    }
    }