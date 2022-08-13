jQuery(function( $ ) {
	const copyToClipboard = str => {
		const el = document.createElement('textarea');
		el.value = str;
		el.setAttribute('readonly', '');
		el.style.position = 'absolute';
		el.style.left = '-9999px';
		document.body.appendChild(el);
		el.select();
		document.execCommand('copy');
		document.body.removeChild(el);
	};

	var saml = $('input[name=SAMLResponse]').val();

	$( 'input.saml-radio' ).each(function () {
		var button = this;
		$( '<a href="#">CLI Credentials</a>' ).appendTo( $(this).parent() ).click(function() {
			var link = this;

			var role = $(button).val();
			var account = role.replace(/^arn:aws:iam::/, '').replace(/:.*$/, '');
			var principal = 'arn:aws:iam::' + account + ':saml-provider/Shibboleth';

			saml = encodeURI( saml );

			$.get( 'https://sts.amazonaws.com/',
							{ Version: '2011-06-15', Action: 'AssumeRoleWithSAML',
								RoleArn: role, PrincipalArn: principal, 
								SAMLAssertion: saml,
								DurationSeconds: 60 * 60 * 8 // 12 hours
							}, function ( data ) {
								if ( $(data).find('ErrorResponse').length > 0 ) {
									alert( 'Error!' );
									window.location.href = 'https://www.bu.edu/awslogin/';
								} else {
									var key = $(data).find('AccessKeyId').text();
									var secret = $(data).find('SecretAccessKey').text();
									var token = $(data).find('SessionToken').text();
							
									var file = 'aws_access_key_id = ' + key + "\naws_secret_access_key = " + secret + "\naws_session_token = " + token + "\n";
									copyToClipboard( file );
									$(link).text( 'Copied' );
									button.click();
									$(link).closest('form').submit();
								}
							});
		});
		
	});
});
