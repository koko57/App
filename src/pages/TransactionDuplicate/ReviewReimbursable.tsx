import {useRoute} from '@react-navigation/native';
import React, {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useReviewDuplicatesNavigation from '@hooks/useReviewDuplicatesNavigation';
import {setReviewDuplicatesKey} from '@libs/actions/Transaction';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {TransactionDuplicateNavigatorParamList} from '@libs/Navigation/types';
import * as TransactionUtils from '@libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {FieldItemType} from './ReviewFields';
import ReviewFields from './ReviewFields';

function ReviewReimbursable() {
    const route = useRoute<PlatformStackRouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.TAG>>();
    const {translate} = useLocalize();
    const transactionID = TransactionUtils.getTransactionID(route.params.threadReportID ?? '');
    const [reviewDuplicates] = useOnyx(ONYXKEYS.REVIEW_DUPLICATES);
    const compareResult = TransactionUtils.compareDuplicateTransactionFields(transactionID, reviewDuplicates?.reportID ?? '-1');
    const stepNames = Object.keys(compareResult.change ?? {}).map((key, index) => (index + 1).toString());
    const {currentScreenIndex, goBack, navigateToNextScreen} = useReviewDuplicatesNavigation(
        Object.keys(compareResult.change ?? {}),
        'reimbursable',
        route.params.threadReportID ?? '',
        route.params.backTo,
    );
    const options = useMemo(
        () =>
            compareResult.change.reimbursable?.map((reimbursable) => ({
                text: reimbursable ? translate('common.yes') : translate('common.no'),
                value: reimbursable ?? false,
            })),
        [compareResult.change.reimbursable, translate],
    );

    const setReimbursable = (data: FieldItemType<'reimbursable'>) => {
        if (data.value !== undefined) {
            setReviewDuplicatesKey({reimbursable: data.value});
        }
        navigateToNextScreen();
    };

    return (
        <ScreenWrapper testID={ReviewReimbursable.displayName}>
            <HeaderWithBackButton
                title={translate('iou.reviewDuplicates')}
                onBackButtonPress={goBack}
            />
            <ReviewFields<'reimbursable'>
                stepNames={stepNames}
                label={translate('violations.isTransactionReimbursable')}
                options={options}
                index={currentScreenIndex}
                onSelectRow={setReimbursable}
            />
        </ScreenWrapper>
    );
}

ReviewReimbursable.displayName = 'ReviewReimbursable';

export default ReviewReimbursable;
