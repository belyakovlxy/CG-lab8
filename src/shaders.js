let vsSource =
    [
        'precision mediump float;',
        'attribute vec3 vertPositions;',
        'attribute vec3 vertColor;',
        'attribute vec3 vertNormal;',
        'attribute vec2 vertTexCoords;',

        'varying vec3 fragColor;',
        'varying vec3 fragPosition;',
        'varying vec3 fragNormal;',
        'varying vec2 fragTexCoords;',
        '',
        'uniform mat4 mWorld;',
        'uniform mat4 mView;',
        'uniform mat4 mProj;',
        'uniform vec3 cubeColor;',
        'uniform mat4 u_normalMatrix;',
        '',
        'uniform vec3 u_viewDirection;',
        'uniform vec3 u_sourceDirection;',
        'uniform vec3 u_sourceDiffuseColor;',
        'uniform vec3 u_sourceSpecularColor;',
        'uniform vec3 u_sourceAmbientColor;',
        '',
        'const vec3 centerPos = vec3(0.0, 0.0, 0.0);',
        '',
        'void main()',
        '{',
        'fragTexCoords = vertTexCoords;',
        'gl_Position = mProj * mView * mWorld * vec4(vertPositions, 1.0);',
        '',
        'vec3 N = normalize(vertNormal);',
        'fragNormal = normalize((u_normalMatrix * vec4(vertNormal,1.0)).xyz);',
        'fragColor = cubeColor;',
        'fragPosition = (mView * mWorld*vec4(vertPositions,1.0)).xyz;',

        '}',
    ].join('\n');

let fsSource =
    [
        'precision mediump float;',
        '',
        'varying vec3 fragColor;',
        'varying vec3 fragPosition;',
        'varying vec3 fragNormal;',
        'varying vec2 fragTexCoords;',
        '',
        'uniform vec3 u_viewDirection;',
        'uniform vec3 u_sourceDirection;',
        'uniform float u_shininess;',
        '',
        'uniform vec3 u_sourceDiffuseColor;',
        'uniform vec3 u_sourceSpecularColor;',
        'uniform vec3 u_sourceAmbientColor;',

        'uniform float u_coefTex;',
        'uniform float u_coefColor;',
        'uniform bool u_blended;',

        'uniform sampler2D u_sampler;',
        '',
        '',
        'void main()',
        '{',

            'float stepTex = 0.0003;',
            'vec4 left = texture2D(u_sampler, vec2(fragTexCoords.x - stepTex, fragTexCoords.y));',
            'vec4 right = texture2D(u_sampler, vec2(fragTexCoords.x + stepTex, fragTexCoords.y));',
            'vec4 bottom = texture2D(u_sampler, vec2(fragTexCoords.x, fragTexCoords.y - stepTex));',
            'vec4 top = texture2D(u_sampler, vec2(fragTexCoords.x, fragTexCoords.y + stepTex));',
            'vec3 gradX = (left - right).xyz;',
            'vec3 gradY = (bottom - top).xyz;',
            'vec3 newNormal = normalize(fragNormal + gradX + gradX);',

            'vec3 color = vec3(0.0, 0.0, 0.0);',
            'vec3 lightDir = normalize(u_sourceDirection - fragPosition);',
            'vec3 viewDir = normalize(u_viewDirection);',
            'float spec = 0.0;',

            'vec3 reflectDir = normalize(reflect(-lightDir,newNormal));',
            'spec = pow(max(dot(viewDir,reflectDir), 0.0), u_shininess * 0.25 *u_shininess);',
            'color = (spec * u_sourceSpecularColor);',

            'float diffuse = max(dot(newNormal,lightDir), 0.0);' +
            '' +
            'gl_FragColor = vec4(color, 1.0) * vec4(fragColor, 1.0) + vec4(color, 1.0) + vec4(fragColor * diffuse * u_sourceDiffuseColor, 1.0) + vec4(u_sourceAmbientColor, 1.0) * vec4(fragColor, 1.0);' +


        '}',
    ].join('\n');