import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { I18nContext } from '../../../../../contexts/i18n';
import {
  addHistoryEntry,
  getRecipient,
  getRecipientUserInput,
  updateRecipient,
  updateRecipientUserInput,
} from '../../../../../ducks/send';
import {
  getDomainError,
  getDomainResolution,
  getDomainWarning,
} from '../../../../../ducks/domains';
import {
  BannerAlert,
  BannerAlertSeverity,
  Box,
} from '../../../../component-library';
import { getAddressBookEntry } from '../../../../../selectors';
import { Tab, Tabs } from '../../../../ui/tabs';
import { AddressListItem } from '../../../address-list-item';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../../../../shared/constants/metametrics';
import {
  MetaMetricsContext,
  type UITrackEventMethod,
} from '../../../../../contexts/metametrics';
import { SendPageAddressBook, SendPageRow, SendPageYourAccounts } from '.';

const CONTACTS_TAB_KEY = 'contacts';
const ACCOUNTS_TAB_KEY = 'accounts';

const ENS_RESOLUTION_TYPE = 'ENS resolution';

const renderExplicitAddress = (
  address: string,
  nickname: string,
  type: string,
  // TODO: Replace `any` with type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatch: any,
  trackEvent: UITrackEventMethod,
) => {
  return (
    <AddressListItem
      address={address}
      label={nickname}
      useConfusable={type === ENS_RESOLUTION_TYPE}
      onClick={() => {
        dispatch(
          addHistoryEntry(
            `sendFlow - User clicked recipient from ${type}. address: ${address}, nickname ${nickname}`,
          ),
        );
        trackEvent({
          event: MetaMetricsEventName.sendRecipientSelected,
          category: MetaMetricsEventCategory.Send,
          properties: {
            location: 'send page recipient screen',
            inputType: type,
          },
        });
        dispatch(updateRecipient({ address, nickname }));
        dispatch(updateRecipientUserInput(address));
      }}
    />
  );
};

export const SendPageRecipient = () => {
  const t = useContext(I18nContext);
  const dispatch = useDispatch();
  const trackEvent = useContext(MetaMetricsContext);

  const recipient = useSelector(getRecipient);
  const userInput = useSelector(getRecipientUserInput) || '';

  const domainResolution = useSelector(getDomainResolution);
  const domainError = useSelector(getDomainError);
  const domainWarning = useSelector(getDomainWarning);

  let addressBookEntryName = '';
  const entry = useSelector((state) =>
    getAddressBookEntry(state, domainResolution),
  );
  if (domainResolution && entry?.name) {
    addressBookEntryName = entry.name;
  }

  const showErrorBanner =
    domainError || (recipient.error && recipient.error !== 'required');
  const showWarningBanner =
    !showErrorBanner && (domainWarning || recipient.warning);

  let contents;
  if (recipient.address) {
    contents = renderExplicitAddress(
      recipient.address,
      recipient.nickname,
      'validated user input',
      dispatch,
      trackEvent,
    );
  } else if (domainResolution && !recipient.error) {
    contents = renderExplicitAddress(
      domainResolution,
      addressBookEntryName || userInput,
      ENS_RESOLUTION_TYPE,
      dispatch,
      trackEvent,
    );
  } else {
    contents = (
      <Tabs
        defaultActiveTabKey={userInput ? CONTACTS_TAB_KEY : ACCOUNTS_TAB_KEY}
      >
        {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          <Tab tabKey={ACCOUNTS_TAB_KEY} name={t('yourAccounts')}>
            <SendPageYourAccounts />
          </Tab>
        }
        {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          <Tab
            tabKey={CONTACTS_TAB_KEY}
            name={t('contacts')}
            data-testid="send-contacts-tab"
          >
            <SendPageAddressBook />
          </Tab>
        }
      </Tabs>
    );
  }

  return (
    <>
      {showErrorBanner ? (
        <SendPageRow>
          <BannerAlert
            severity={BannerAlertSeverity.Danger}
            data-testid="send-recipient-error"
          >
            {t(domainError ?? recipient.error)}
          </BannerAlert>
        </SendPageRow>
      ) : null}
      {showWarningBanner ? (
        <SendPageRow>
          <BannerAlert
            severity={BannerAlertSeverity.Warning}
            data-testid="send-recipient-warning"
          >
            {t(domainWarning ?? recipient.warning)}
          </BannerAlert>
        </SendPageRow>
      ) : null}
      <Box className="multichain-send-page__recipient">{contents}</Box>
    </>
  );
};
