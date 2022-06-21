import { IMaritalStatus, ISex } from '../models/profile-types';

export class ProfileDto {
  id: number;
  name: string;
  secondName: string;
  sex: ISex;
  from: string;
  birthDate: string;
  maritalStatus: IMaritalStatus;
}
