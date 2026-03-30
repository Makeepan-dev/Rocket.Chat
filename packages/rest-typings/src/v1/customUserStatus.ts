import type { ICustomUserStatus } from '@rocket.chat/core-typings';
import type { PaginatedRequest } from '../helpers/PaginatedRequest';
import type { PaginatedResult } from '../helpers/PaginatedResult';
import { ajv, ajvQuery } from './Ajv';

export type CustomUserStatusEndpoints = {
	'/v1/custom-user-status.list': {
		GET: (params: PaginatedRequest<{ name?: string; _id?: string; query?: string }>) => PaginatedResult<{
			statuses: ICustomUserStatus[];
		}>;
	};
	'/v1/custom-user-status.create': {
		POST: (params: { name: string; statusType?: string }) => {
			customUserStatus: ICustomUserStatus;
		};
	};
	'/v1/custom-user-status.delete': {
		POST: (params: { customUserStatusId: string }) => void;
	};
	'/v1/custom-user-status.update': {
		POST: (params: { _id: string; name?: string; statusType?: string }) => {
			customUserStatus: ICustomUserStatus;
		};
	};
};

export type CustomUserStatusListProps = PaginatedRequest<{ name?: string; _id?: string; query?: string }>;

export const isCustomUserStatusListProps = ajvQuery.compile<CustomUserStatusListProps>({
	type: 'object',
	properties: {
		count: {
			type: 'number',
			nullable: true,
		},
		offset: {
			type: 'number',
			nullable: true,
		},
		sort: {
			type: 'string',
			nullable: true,
		},
		name: {
			type: 'string',
			nullable: true,
		},
		_id: {
			type: 'string',
			nullable: true,
		},
		query: {
			type: 'string',
			nullable: true,
		},
	},
	required: [],
	additionalProperties: false,
});

export type CustomUserStatusCreateProps = { name: string; statusType?: string };
export const isCustomUserStatusCreateProps = ajv.compile<CustomUserStatusCreateProps>({
	type: 'object',
	properties: { name: { type: 'string' }, statusType: { type: 'string', nullable: true } },
	required: ['name'],
	additionalProperties: false,
});

export type CustomUserStatusUpdateProps = { _id: string; name: string; statusType?: string };
export const isCustomUserStatusUpdateProps = ajv.compile<CustomUserStatusUpdateProps>({
	type: 'object',
	properties: { _id: { type: 'string' }, name: { type: 'string' }, statusType: { type: 'string', nullable: true } },
	required: ['_id', 'name'],
	additionalProperties: false,
});

export type CustomUserStatusDeleteProps = { customUserStatusId: string };
export const isCustomUserStatusDeleteProps = ajv.compile<CustomUserStatusDeleteProps>({
	type: 'object',
	properties: { customUserStatusId: { type: 'string' } },
	required: ['customUserStatusId'],
	additionalProperties: false,
});

