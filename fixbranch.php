#!/usr/bin/env php
<?php

$argv = $_SERVER['argv'];
if (count($argv) < 2) {
    echo "Usage: php fixbranch.php <branchname>\n";
    exit(1);
}
$branch = $argv[1];

$files = array_merge(
    glob(__DIR__ . '/.github/actions/*/*.yml'),
    glob(__DIR__ . '/.github/workflows/*.yml')
);

foreach ($files as $file) {
    $content = file_get_contents($file);
    $newcontent = preg_replace('/(uses: dokuwiki\/github-action\/.*@)\w+/', '\1' . $branch, $content);
    if ($newcontent !== $content) {
        file_put_contents($file, $newcontent);
        echo "Updated $file\n";
    }
}
