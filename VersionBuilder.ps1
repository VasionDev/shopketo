[CmdletBinding()]
param(

    [Parameter(Mandatory = $true)]
    [String]
    $OriginalBuildNumber
)

process {
    $release_notes = Get-Content -path release_notes.md | Select-String -AllMatches '^(#### )(\d+\.\d+\.\d+)' 

    $versions = @();


    foreach ($match in  $release_notes.Matches) {
        $version = [version]$match.groups[2].value;
        if (($version.Major -lt 0) -or ($version.Minor -lt 0) -or ($version.Build -lt 0) -or ($version.Revision -ne -1)) {
            THROW "Core versions should have only Major.Minor.Build (x.x.x) - no revision (x.x.x.y)"
        }

        $versions += $version;
    }

    $versions = ($versions | Sort-Object)
    $lastVersion = $versions[-1]
    $buildNumber = "$lastVersion-b$($OriginalBuildNumber)"

    Write-Host "##vso[task.setvariable variable=ReleaseVersion;]$lastVersion"
    Write-Host "##vso[task.setvariable variable=ProjectBuildNumber;]$buildNumber"
    Write-Host "##vso[build.updatebuildnumber]$buildNumber"
}