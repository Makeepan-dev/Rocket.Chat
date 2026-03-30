import type { ICustomUserStatus } from '@rocket.chat/core-typings';
import { CustomUserStatus } from '@rocket.chat/models';
import {
	ajv,
	validateUnauthorizedErrorResponse,
	validateBadRequestErrorResponse,
	isCustomUserStatusCreateProps,
	isCustomUserStatusUpdateProps,
	isCustomUserStatusDeleteProps,
	isCustomUserStatusListProps,
} from '@rocket.chat/rest-typings';
import type { PaginatedResult } from '@rocket.chat/rest-typings';
import { escapeRegExp } from '@rocket.chat/string-helpers';
import { Meteor } from 'meteor/meteor';

import { deleteCustomUserStatus } from '../../../user-status/server/methods/deleteCustomUserStatus';
import { insertOrUpdateUserStatus } from '../../../user-status/server/methods/insertOrUpdateUserStatus';
import { API } from '../api';
import { getPaginationItems } from '../helpers/getPaginationItems';



API.v1.get(
	'custom-user-status.list',
	{
		authRequired: true,
		query: isCustomUserStatusListProps,
		response: {
			200: ajv.compile<
				PaginatedResult<{
					statuses: ICustomUserStatus[];
				}>
			>({
				type: 'object',
				properties: {
					statuses: {
						type: 'array',
						items: {
							$ref: '#/components/schemas/ICustomUserStatus',
						},
					},
					count: {
						type: 'number',
						description: 'The number of custom user statuses returned in this response.',
					},
					offset: {
						type: 'number',
						description: 'The number of custom user statuses that were skipped in this response.',
					},
					total: {
						type: 'number',
						description: 'The total number of custom user statuses that match the query.',
					},
					success: {
						type: 'boolean',
						enum: [true],
						description: 'Indicates if the request was successful.',
					},
				},
				required: ['success', 'statuses', 'count', 'offset', 'total'],
				additionalProperties: false,
			}),
			400: validateBadRequestErrorResponse,
			401: validateUnauthorizedErrorResponse,
		},
	},
	async function action() {
		const { offset, count } = await getPaginationItems(this.queryParams as Record<string, string | number | null | undefined>);
		const { sort, query } = await this.parseJsonQuery();

		const { name, _id } = this.queryParams;

		const filter = {
			...query,
			...(name ? { name: { $regex: escapeRegExp(name as string), $options: 'i' } } : {}),
			...(_id ? { _id } : {}),
		};

		const { cursor, totalCount } = CustomUserStatus.findPaginated(filter, {
			sort: sort || { name: 1 },
			skip: offset,
			limit: count,
		});

		const [statuses, total] = await Promise.all([cursor.toArray(), totalCount]);

		return API.v1.success({
			statuses,
			count: statuses.length,
			offset,
			total,
		});
	},
)
	.post(
		'custom-user-status.create',
		{
			authRequired: true,
			validateParams: isCustomUserStatusCreateProps,
			response: {
				200: ajv.compile<{
					customUserStatus: ICustomUserStatus;
				}>({
					type: 'object',
					properties: {
						customUserStatus: {
							$ref: '#/components/schemas/ICustomUserStatus',
						},
						success: {
							type: 'boolean',
							enum: [true],
							description: 'Indicates if the request was successful.',
						},
					},
					required: ['success', 'customUserStatus'],
					additionalProperties: false,
				}),
				400: validateBadRequestErrorResponse,
				401: validateUnauthorizedErrorResponse,
			},
		},
		async function action() {
		const { name, statusType } = this.bodyParams;

		const userStatusData = {
			name,
			statusType: statusType || '',
		};

		await insertOrUpdateUserStatus(this.userId, userStatusData);

		const customUserStatus = await CustomUserStatus.findOneByName(userStatusData.name);
		if (!customUserStatus) {
			throw new Meteor.Error('error-creating-custom-user-status', 'Error creating custom user status');
		}

		return API.v1.success({
			customUserStatus,
		});
	},
)
	.post(
		'custom-user-status.delete',
		{
			authRequired: true,
			validateParams: isCustomUserStatusDeleteProps,
			response: {
				200: ajv.compile<void>({
					type: 'object',
					properties: {
						success: {
							type: 'boolean',
							enum: [true],
							description: 'Indicates if the request was successful.',
						},
					},
					required: ['success'],
					additionalProperties: false,
				}),
				400: validateBadRequestErrorResponse,
				401: validateUnauthorizedErrorResponse,
			},
		},
		async function action() {
		const { customUserStatusId } = this.bodyParams;

		await deleteCustomUserStatus(this.userId, customUserStatusId);

		return API.v1.success();
	},
)
	.post(
		'custom-user-status.update',
		{
			authRequired: true,
			validateParams: isCustomUserStatusUpdateProps,
			response: {
				200: ajv.compile<{
					customUserStatus: ICustomUserStatus;
				}>({
					type: 'object',
					properties: {
						customUserStatus: {
							$ref: '#/components/schemas/ICustomUserStatus',
						},
						success: {
							type: 'boolean',
							enum: [true],
							description: 'Indicates if the request was successful.',
						},
					},
					required: ['success', 'customUserStatus'],
					additionalProperties: false,
				}),
				400: validateBadRequestErrorResponse,
				401: validateUnauthorizedErrorResponse,
			},
		},
		async function action() {
		const { _id, name, statusType } = this.bodyParams;

		const userStatusData = {
			_id,
			name,
			statusType,
		};

			const customUserStatusToUpdate = await CustomUserStatus.findOneById(userStatusData._id);

			// Ensure the message exists
			if (!customUserStatusToUpdate) {
				return API.v1.failure(`No custom user status found with the id of "${userStatusData._id}".`);
			}

			await insertOrUpdateUserStatus(this.userId, userStatusData);

		const customUserStatus = await CustomUserStatus.findOneById(userStatusData._id);

		if (!customUserStatus) {
			throw new Meteor.Error('error-updating-custom-user-status', 'Error updating custom user status');
		}

		return API.v1.success({
			customUserStatus,
		});
	},
);


