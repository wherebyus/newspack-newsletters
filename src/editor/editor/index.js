/**
 * WordPress dependencies
 */
import { compose } from '@wordpress/compose';
import apiFetch from '@wordpress/api-fetch';
import { withDispatch, withSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';

export default compose( [
	withDispatch( dispatch => {
		const { lockPostSaving, unlockPostSaving } = dispatch( 'core/editor' );
		return { lockPostSaving, unlockPostSaving };
	} ),
	withSelect( select => {
		const { getCurrentPostId } = select( 'core/editor' );
		return { postId: getCurrentPostId() };
	} ),
] )( props => {
	const [ campaign, setCampaign ] = useState();
	useEffect( () => {
		const { recipients, status } = campaign || {};
		const { list_id: listId } = recipients || {};
		if ( 'sent' === status || 'sending' === status || ! listId ) {
			props.lockPostSaving( 'newspack-newsletters-post-lock' );
		} else {
			props.unlockPostSaving( 'newspack-newsletters-post-lock' );
		}
		const { postId } = props;
		apiFetch( { path: `/newspack-newsletters/v1/mailchimp/${ postId }` } ).then( result =>
			setCampaign( result.campaign )
		);
	} );
	return null;
} );
