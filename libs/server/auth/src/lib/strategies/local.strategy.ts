import { Injectable } from "@nestjs/common";
import { Strategy } from 'passport-local';
import { PassportStrategy } from "@nestjs/passport";
import { ServerAuthService } from "../auth.service";
import { AuthenticatedUser } from "../interfaces/authenticated-user.interface";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: ServerAuthService) {
        super({usernameField:'email'});
    }
    
    async validate(email: string, password: string): Promise<AuthenticatedUser>
    {
        return this.authService.validateUser(email,password);
    }
}

