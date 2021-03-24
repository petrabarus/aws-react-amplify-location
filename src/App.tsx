import logo from './logo.svg';
import './App.css';

import React from "react";
import ReactDOM from "react-dom";
import Amplify from "aws-amplify";
import { Signer, ICredentials } from "@aws-amplify/core";
import { Auth } from "aws-amplify";

import ReactMapGL, {
  NavigationControl,
  ViewportProps,
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import "./index.css";
import amplifyConfig from "./aws-exports";

Amplify.configure(amplifyConfig);

const mapName = "MyMap";


const transformRequest = (credentials: ICredentials) => (
  url?: string,
  resourceType?: string
) => {
  // Resolve to an AWS URL
  if (resourceType === "Style" && !url?.includes("://")) {
    url = `https://maps.geo.${amplifyConfig.aws_project_region}.amazonaws.com/maps/v0/maps/${url}/style-descriptor`;
  }

  // Only sign AWS requests (with the signature as part of the query string)
  if (url?.includes("amazonaws.com")) {
    return {
      url: Signer.signUrl(url, {
        access_key: credentials.accessKeyId,
        secret_key: credentials.secretAccessKey,
        session_token: credentials.sessionToken,
      }),
    };
  }

  // Don't sign
  return { url: url || "" };
};


const App = () => {
  const [credentials, setCredentials] = React.useState<ICredentials | null>(
    null
  );
  
  const [viewport, setViewport] = React.useState<Partial<ViewportProps>>({
    longitude: 106.816666,
    latitude: -6.200000,
    zoom: 10,
  });
  
  
  React.useEffect(() => {
    const fetchCredentials = async () => {
      setCredentials(await Auth.currentUserCredentials());
    };

    fetchCredentials();
  }, []);

  return (
    <div>
    
    {credentials ? (
        <ReactMapGL
          {...viewport}
          width="100%"
          height="100vh"
          transformRequest={transformRequest(credentials)}
          mapStyle={mapName}
          onViewportChange={setViewport}
        >
          <div style={{ position: "absolute", left: 20, top: 20 }}>
            {/* react-map-gl v5 doesn't support dragging the compass to change bearing */}
            <NavigationControl showCompass={false} />
          </div>
        </ReactMapGL>
      ) : (
        <h1>Loading...</h1>
      )}
    
    </div>
  );
}

export default App;
