import React, { useEffect, useState } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { listQChatRequests } from './graphql/queries';

const QChatRequestList = ({ userEmail }) => {
  const [websites, setWebsites] = useState([]);

  useEffect(() => {
    fetchWebsites();
  }, [userEmail]);

  const fetchWebsites = async () => {
    try {
      const websiteData = await API.graphql(
        graphqlOperation(listQChatRequests, {
          filter: { userEmail: { eq: userEmail } }
        })
      );
      const websiteList = websiteData.data.listQChatRequests.items;
      setWebsites(websiteList);
    } catch (error) {
      console.log('Error fetching websites', error);
    }
  };

  return (
    <div>
      <h2>Your Websites</h2>
      <ul>
        {websites.map((site) => (
          <li key={site.id}>{site.website}</li>
        ))}
      </ul>
    </div>
  );
};

export default QChatRequestList;