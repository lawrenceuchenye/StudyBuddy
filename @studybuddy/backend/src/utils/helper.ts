import { Types } from "mongoose";
import { IUserGoals } from "../models/user";
import UserRepository from "../repositories/user";

export type ObjectKeyProp =
	| UserRepository.UserInformationUpdatePayload
	| { [key: string]: string | number | object }
	| (IUserGoals & { id: Types.ObjectId });

export const removeEmptyKeys = (obj: ObjectKeyProp): ObjectKeyProp => {
	const newObj: ObjectKeyProp = {};
	for (const key in obj) {
		if (
			obj[`${key as keyof ObjectKeyProp}`] !== null &&
			obj[key as keyof ObjectKeyProp] !== undefined &&
			obj[key as keyof ObjectKeyProp] !== ""
		) {
			newObj[key as keyof ObjectKeyProp] = obj[key as keyof ObjectKeyProp];
		}
	}
	return newObj;
};

export const filterObjectKeys = (
	originalObject: ObjectKeyProp,
	keysToInclude: string[]
): ObjectKeyProp => {
	const filteredObject: ObjectKeyProp = {};

	keysToInclude.forEach((key) => {
		if (originalObject.hasOwnProperty(key)) {
			filteredObject[key] = originalObject[key as keyof ObjectKeyProp];
		}
	});

	return filteredObject;
};
