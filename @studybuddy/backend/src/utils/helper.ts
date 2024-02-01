export type ObjectKeyProp = { [key: string]: string };
export const removeEmptyKeys = (obj: ObjectKeyProp) => {
	const newObj: ObjectKeyProp = {};
	for (const key in obj) {
		if (obj[key] !== null && obj[key] !== undefined && obj[key] !== "") {
			newObj[key] = obj[key];
		}
	}
	return newObj;
};
