/**
 * WordPress dependencies
 */
import { withDispatch, withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default compose( [
	withDispatch( dispatch => {
		const { editPost, savePost } = dispatch( 'core/editor' );
		return { editPost, savePost };
	} ),
	withSelect( ( select, { forceIsSaving, forceIsDirty } ) => {
		const {
			getEditedPostAttribute,
			isEditedPostPublishable,
			isEditedPostSaveable,
			isSavingPost,
			isEditedPostBeingScheduled,
		} = select( 'core/editor' );
		const meta = getEditedPostAttribute( 'meta' );
		return {
			isPublishable: forceIsDirty || isEditedPostPublishable(),
			isSaveable: isEditedPostSaveable(),
			isSaving: forceIsSaving || isSavingPost(),
			validationErrors: meta.campaignValidationErrors,
			status: getEditedPostAttribute( 'status' ),
			isEditedPostBeingScheduled: isEditedPostBeingScheduled(),
		};
	} ),
] )(
	( {
		editPost,
		isPublishable,
		isSaveable,
		isSaving,
		savePost,
		status,
		validationErrors,
		isEditedPostBeingScheduled,
	} ) => {
		const isButtonEnabled =
			( isPublishable || isEditedPostBeingScheduled ) &&
			isSaveable &&
			validationErrors &&
			! validationErrors.length &&
			'publish' !== status;
		let label;
		if ( 'publish' === status ) {
			label = isSaving
				? __( 'Sending', 'newspack-newsletters' )
				: __( 'Sent', 'newspack-newsletters' );
		} else if ( 'future' === status ) {
			// Scheduled to be sent
			label = __( 'Scheduled', 'newspack-newsletters' );
		} else if ( isEditedPostBeingScheduled ) {
			label = __( 'Schedule sending', 'newspack-newsletters' );
		} else {
			label = __( 'Send', 'newspack-newsletters' );
		}
		const onClick = () => {
			editPost( { status: isEditedPostBeingScheduled ? 'future' : 'publish' } );
			savePost();
		};

		return (
			<Button
				className="editor-post-publish-button"
				isBusy={ isSaving && 'publish' === status }
				isPrimary
				isLarge
				onClick={ onClick }
				disabled={ ! isButtonEnabled }
			>
				{ label }
			</Button>
		);
	}
);
